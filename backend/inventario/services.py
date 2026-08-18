from rest_framework.exceptions import ValidationError
from django.db import transaction

from .models import (
    Producto,
    VarianteProducto,
    MovimientoStock,
)


@transaction.atomic
def ingresar_stock(variante_id, cantidad, observacion=""):
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

    variante.stock_actual += cantidad

    variante.save(
        update_fields=["stock_actual"]
    )

    MovimientoStock.objects.create(
        variante_producto=variante,
        tipo_movimiento="ENTRADA",
        cantidad=cantidad,
        observacion=observacion,
    )

    return variante


@transaction.atomic
def ingresar_mercaderia(
    codigo,
    prenda,
    modelo,
    color,
    talle,
    cantidad,
    costo,
    costo_extra,
    proveedor,
    descripcion="",
):
    if cantidad <= 0:
        raise ValidationError(
            "La cantidad debe ser mayor a cero."
        )

    producto, producto_creado = Producto.objects.get_or_create(
        codigo=codigo,
        defaults={
            "prenda": prenda,
            "modelo": modelo,
            "descripcion": descripcion,
            "costo": costo,
            "costo_extra": costo_extra,
            "proveedor": proveedor,
            "activo": True,
        },
    )

    variante, variante_creada = VarianteProducto.objects.get_or_create(
        producto=producto,
        color=color,
        talle=talle,
        defaults={
            "stock_actual": 0
        },
    )

    variante = (
        VarianteProducto.objects
        .select_for_update()
        .get(id=variante.id)
    )

    variante.stock_actual += cantidad

    variante.save(
        update_fields=["stock_actual"]
    )

    MovimientoStock.objects.create(
        variante_producto=variante,
        tipo_movimiento="ENTRADA",
        cantidad=cantidad,
        observacion="Ingreso de mercadería",
    )

    return (
        producto,
        variante,
        producto_creado,
        variante_creada,
    )