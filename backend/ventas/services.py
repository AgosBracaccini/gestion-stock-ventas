from decimal import Decimal
from django.db import transaction
from rest_framework.exceptions import ValidationError
from inventario.models import VarianteProducto, MovimientoStock
from .models import Venta, DetalleVenta
from django.db.models import Sum
from django.utils import timezone
def obtener_precio(producto, medio_pago):
    precios = {
        "EFECTIVO": producto.precio_efectivo,
        "TRANSFERENCIA": producto.precio_efectivo,
        "DEBITO": producto.precio_debito,
        "CREDITO": producto.precio_tarjeta,
        "FAST_CRED": producto.precio_fast_cred,
        "FINAN_YA": producto.precio_finan_ya,
    }

    try:
        return precios[medio_pago]
    except KeyError:
        raise ValidationError("Medio de pago inválido.")


@transaction.atomic
def realizar_venta(
    medio_pago,
    items,
    nombre_transferencia="",
    apellido_transferencia="",
    telefono_transferencia="",
    ):
    if not items:
        raise ValidationError(
            "La venta debe contener al menos un producto."
        )
    
    variantes_ids = [
        item["variante_id"]
        for item in items
    ]

    if len(variantes_ids) != len(set(variantes_ids)):
        raise ValidationError(
            "Una misma variante no puede aparecer más de una vez en la venta."
        )
        
    medios_validos = {
        opcion[0] for opcion in Venta.MEDIOS_PAGO
    }

    if medio_pago not in medios_validos:
        raise ValidationError(
            "Medio de pago inválido."
        )
    venta = Venta.objects.create(
        medio_pago=medio_pago,
        total=Decimal("0.00"),
        nombre_transferencia=nombre_transferencia,
        apellido_transferencia=apellido_transferencia,
        telefono_transferencia=telefono_transferencia,
    )

    total_venta = Decimal("0.00")

    for item in items:
        variante_id = item["variante_id"]
        cantidad = item["cantidad"]

        if cantidad <= 0:
            raise ValidationError(
                "La cantidad debe ser mayor a cero."
            )
            
        try:
            variante = (
                VarianteProducto.objects
                .select_for_update()
                .select_related("producto")
                .get(id=variante_id)
            )
        except VarianteProducto.DoesNotExist:
            raise ValidationError(
                f"La variante con id {variante_id} no existe."
            )   
            
        if not variante.producto.activo:
            raise ValidationError(
                f"El producto {variante.producto.codigo} se encuentra inactivo."
            )

        if variante.stock_actual < cantidad:
            raise ValidationError(
                f"Stock insuficiente para {variante}. "
                f"Disponible: {variante.stock_actual}."
            )

        precio_unitario = obtener_precio(
            variante.producto,
            medio_pago
        )

        subtotal = precio_unitario * cantidad

        DetalleVenta.objects.create(
            venta=venta,
            variante_producto=variante,
            cantidad=cantidad,
            precio_unitario=precio_unitario,
            subtotal=subtotal,
        )

        variante.stock_actual -= cantidad
        variante.save(update_fields=["stock_actual"])

        MovimientoStock.objects.create(
            variante_producto=variante,
            tipo_movimiento="VENTA",
            cantidad=cantidad,
            observacion=f"Venta #{venta.id}",
        )

        total_venta += subtotal

    venta.total = total_venta
    venta.save(update_fields=["total"])

    return venta

def obtener_resumen_dashboard():
    hoy = timezone.localdate()

    ventas_hoy = Venta.objects.filter(
        fecha__date=hoy
    )

    ventas_mes = Venta.objects.filter(
        fecha__year=hoy.year,
        fecha__month=hoy.month,
    )

    total_hoy = (
        ventas_hoy.aggregate(total=Sum("total"))["total"]
        or Decimal("0.00")
    )

    total_mes = (
        ventas_mes.aggregate(total=Sum("total"))["total"]
        or Decimal("0.00")
    )

    stock_bajo = VarianteProducto.objects.filter(
        stock_actual__gt=0,
        stock_actual__lte=3,
    ).count()

    sin_stock = VarianteProducto.objects.filter(
        stock_actual=0
    ).count()

    return {
        "ventas_hoy": ventas_hoy.count(),
        "total_hoy": str(total_hoy),
        "ventas_mes": ventas_mes.count(),
        "total_mes": str(total_mes),
        "stock_bajo": stock_bajo,
        "sin_stock": sin_stock,
    }