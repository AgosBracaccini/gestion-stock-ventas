from django.contrib import admin

from .models import Venta, DetalleVenta


class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "fecha",
        "medio_pago",
        "total",
    )

    list_filter = (
        "medio_pago",
        "fecha",
    )

    inlines = [DetalleVentaInline]


@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):
    list_display = (
        "venta",
        "variante_producto",
        "cantidad",
        "precio_unitario",
        "subtotal",
    )