from django.contrib import admin

from .models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
)


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre")
    search_fields = ("nombre",)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        "codigo",
        "prenda",
        "modelo",
        "proveedor",
        "costo",
        "activo",
    )
    search_fields = ("codigo", "prenda", "modelo")
    list_filter = ("activo", "proveedor")


@admin.register(VarianteProducto)
class VarianteProductoAdmin(admin.ModelAdmin):
    list_display = (
        "producto",
        "color",
        "talle",
        "stock_actual",
    )
    search_fields = (
        "producto__codigo",
        "producto__prenda",
        "color",
        "talle",
    )


@admin.register(MovimientoStock)
class MovimientoStockAdmin(admin.ModelAdmin):
    list_display = (
        "variante_producto",
        "tipo_movimiento",
        "cantidad",
        "fecha",
    )
    list_filter = ("tipo_movimiento",)