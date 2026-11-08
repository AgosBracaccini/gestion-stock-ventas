"""
Importación de ventas históricas desde un Excel.

El Excel trae una fila por prenda vendida. Las filas que comparten el mismo
número de VENTA forman una sola venta. Columnas obligatorias: VENTA, FECHA,
MEDIO DE PAGO, CODIGO, COLOR, TALLE, CANTIDAD y PRECIO UNITARIO. Para las
transferencias también hacen falta NOMBRE, APELLIDO y TELEFONO.

Decisiones de diseño:
- No modifica el stock ni crea movimientos: el stock importado ya es el
  actual, y descontarlo de nuevo lo contaría dos veces.
- Respeta la fecha y el precio que figuran en el Excel.
- Una venta con algún problema se informa y no impide cargar las demás.
- Si una venta ya existe (misma fecha, medio de pago y total) se omite, de
  modo que volver a importar el mismo archivo no duplica nada.
"""

from collections import OrderedDict
from datetime import date, datetime, time
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from openpyxl import load_workbook

from inventario.importar_excel import (
    _a_decimal,
    _armar_mapa_encabezados,
    _normalizar,
    _valor,
)
from inventario.models import VarianteProducto

from .models import DetalleVenta, Venta

REQUERIDOS = [
    "VENTA",
    "FECHA",
    "MEDIO DE PAGO",
    "CODIGO",
    "COLOR",
    "TALLE",
    "CANTIDAD",
    "PRECIO UNITARIO",
]

MEDIOS_VALIDOS = {codigo for codigo, _ in Venta.MEDIOS_PAGO}


def _a_fecha(valor):
    """Acepta una fecha de Excel o texto dd/mm/aaaa [hh:mm]. Devuelve None si no sirve."""
    if isinstance(valor, datetime):
        fecha = valor
    elif isinstance(valor, date):
        fecha = datetime.combine(valor, time(12, 0))
    else:
        texto = str(valor or "").strip()
        fecha = None
        for formato in ("%d/%m/%Y %H:%M", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                fecha = datetime.strptime(texto, formato)
                break
            except ValueError:
                continue
        if fecha is None:
            return None

    if timezone.is_naive(fecha):
        fecha = timezone.make_aware(fecha)
    return fecha


def _a_medio_pago(valor):
    texto = _normalizar(valor).replace(" ", "_")
    return texto if texto in MEDIOS_VALIDOS else None


def _indice_variantes():
    indice = {}
    for variante in VarianteProducto.objects.select_related("producto"):
        clave = (
            variante.producto.codigo.strip(),
            _normalizar(variante.color),
            _normalizar(variante.talle),
        )
        indice[clave] = variante
    return indice


def _validar_grupo(clave, grupo, mapa, indice):
    """Devuelve (datos de la venta, None) o (None, mensaje de error)."""
    primera = grupo["filas"][0]

    fecha = _a_fecha(_valor(primera, mapa, "FECHA"))
    if fecha is None:
        return None, f"Venta {clave}: la fecha falta o no es válida."

    medio = _a_medio_pago(_valor(primera, mapa, "MEDIO DE PAGO"))
    if medio is None:
        return None, f"Venta {clave}: el medio de pago no es válido."

    lineas = []
    vistas = set()
    total = Decimal("0.00")

    for fila in grupo["filas"]:
        if (
            _a_fecha(_valor(fila, mapa, "FECHA")) != fecha
            or _a_medio_pago(_valor(fila, mapa, "MEDIO DE PAGO")) != medio
        ):
            return None, f"Venta {clave}: las filas tienen distinta fecha o medio de pago."

        codigo = str(_valor(fila, mapa, "CODIGO") or "").strip()
        color = _valor(fila, mapa, "COLOR")
        talle = _valor(fila, mapa, "TALLE")
        variante = indice.get((codigo, _normalizar(color), _normalizar(talle)))
        if variante is None:
            return None, f"Venta {clave}: no existe la variante {codigo} {color} {talle}."

        if variante.id in vistas:
            return None, f"Venta {clave}: la variante {codigo} {color} {talle} aparece más de una vez."
        vistas.add(variante.id)

        try:
            cantidad = int(_valor(fila, mapa, "CANTIDAD"))
        except (TypeError, ValueError):
            return None, f"Venta {clave}: la cantidad no es un número válido."
        if cantidad < 1:
            return None, f"Venta {clave}: la cantidad debe ser al menos 1."

        precio_crudo = _valor(fila, mapa, "PRECIO UNITARIO")
        precio = None if precio_crudo is None else _a_decimal(precio_crudo, default=None)
        if precio is None or precio < 0:
            return None, f"Venta {clave}: el precio unitario falta o no es válido."

        subtotal = precio * cantidad
        total += subtotal
        lineas.append(
            {
                "variante_id": variante.id,
                "cantidad": cantidad,
                "precio_unitario": precio,
                "subtotal": subtotal,
            }
        )

    nombre = str(_valor(primera, mapa, "NOMBRE") or "").strip()
    apellido = str(_valor(primera, mapa, "APELLIDO") or "").strip()
    telefono = str(_valor(primera, mapa, "TELEFONO") or "").strip()
    if medio == "TRANSFERENCIA" and not (nombre and apellido and telefono):
        return None, (
            f"Venta {clave}: faltan nombre, apellido o teléfono "
            "(obligatorios en las transferencias)."
        )

    return {
        "fecha": fecha,
        "medio_pago": medio,
        "total": total.quantize(Decimal("0.01")),
        "nombre": nombre,
        "apellido": apellido,
        "telefono": telefono,
        "lineas": lineas,
    }, None


def importar_ventas_desde_excel(archivo):
    wb = load_workbook(archivo, data_only=True)

    hoja = None
    for nombre in wb.sheetnames:
        if _normalizar(nombre) == "VENTAS":
            hoja = wb[nombre]
            break
    if hoja is None:
        hoja = wb.active

    filas = list(hoja.iter_rows(values_only=True))
    if not filas:
        return {"creados": 0, "actualizados": 0, "omitidas": 0, "errores": []}

    mapa = _armar_mapa_encabezados(filas[0])
    faltantes = [r for r in REQUERIDOS if r not in mapa]
    if faltantes:
        return {
            "creados": 0,
            "actualizados": 0,
            "omitidas": 0,
            "errores": [
                {
                    "fila": 1,
                    "mensaje": f"Faltan columnas en el excel: {', '.join(faltantes)}.",
                    "datos": None,
                }
            ],
        }

    grupos = OrderedDict()
    for numero_fila, fila in enumerate(filas[1:], start=2):
        clave = _valor(fila, mapa, "VENTA")
        if clave is None:
            continue
        grupo = grupos.setdefault(str(clave).strip(), {"fila": numero_fila, "filas": []})
        grupo["filas"].append(fila)

    indice = _indice_variantes()
    existentes = {
        (v.fecha, v.medio_pago, v.total)
        for v in Venta.objects.only("fecha", "medio_pago", "total")
    }

    nuevas = []
    omitidas = 0
    errores = []

    for clave, grupo in grupos.items():
        datos, mensaje = _validar_grupo(clave, grupo, mapa, indice)
        if mensaje:
            errores.append({"fila": grupo["fila"], "mensaje": mensaje, "datos": None})
            continue

        llave = (datos["fecha"], datos["medio_pago"], datos["total"])
        if llave in existentes:
            omitidas += 1
            continue

        existentes.add(llave)
        nuevas.append(datos)

    with transaction.atomic():
        ventas = Venta.objects.bulk_create(
            [
                Venta(
                    medio_pago=d["medio_pago"],
                    total=d["total"],
                    nombre_transferencia=d["nombre"],
                    apellido_transferencia=d["apellido"],
                    telefono_transferencia=d["telefono"],
                    # Es historia: no queda nada pendiente de verificar.
                    transferencia_verificada=True,
                )
                for d in nuevas
            ],
            batch_size=500,
        )

        # La fecha se asigna sola al crear (auto_now_add), así que se corrige después.
        for venta, datos in zip(ventas, nuevas):
            venta.fecha = datos["fecha"]
        Venta.objects.bulk_update(ventas, ["fecha"], batch_size=500)

        DetalleVenta.objects.bulk_create(
            [
                DetalleVenta(
                    venta=venta,
                    variante_producto_id=linea["variante_id"],
                    cantidad=linea["cantidad"],
                    precio_unitario=linea["precio_unitario"],
                    subtotal=linea["subtotal"],
                )
                for venta, datos in zip(ventas, nuevas)
                for linea in datos["lineas"]
            ],
            batch_size=1000,
        )

    return {
        "creados": len(nuevas),
        "actualizados": 0,
        "omitidas": omitidas,
        "errores": errores,
    }