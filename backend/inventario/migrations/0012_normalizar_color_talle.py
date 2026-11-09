from django.db import migrations

import re


def _limpiar(texto):
    return re.sub(r"\s+", " ", str(texto or "").strip())


def _color(texto):
    t = _limpiar(texto)
    return t[:1].upper() + t[1:].lower()


def _talle(texto):
    return _limpiar(texto).upper()


def unificar(apps, schema_editor):
    Variante = apps.get_model("inventario", "VarianteProducto")
    Movimiento = apps.get_model("inventario", "MovimientoStock")
    CajaItem = apps.get_model("inventario", "CajaItem")
    Detalle = apps.get_model("ventas", "DetalleVenta")

    grupos = {}
    for v in Variante.objects.order_by("id"):
        clave = (v.producto_id, _color(v.color), _talle(v.talle))
        grupos.setdefault(clave, []).append(v)

    for (_, color, talle), variantes in grupos.items():
        principal, repetidas = variantes[0], variantes[1:]

        for r in repetidas:
            principal.stock_actual += r.stock_actual
            Movimiento.objects.filter(variante_producto=r).update(variante_producto=principal)
            CajaItem.objects.filter(variante=r).update(variante=principal)
            Detalle.objects.filter(variante_producto=r).update(variante_producto=principal)
            r.delete()

        principal.color = color
        principal.talle = talle
        principal.save()


class Migration(migrations.Migration):

    dependencies = [
        ("inventario", "0011_caja_cajaitem"),
        ("ventas", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(unificar, migrations.RunPython.noop),
    ]