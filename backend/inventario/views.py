from rest_framework import viewsets

from .models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
)

from .serializers import (
    ProveedorSerializer,
    ProductoSerializer,
    VarianteProductoSerializer,
    MovimientoStockSerializer,
)


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related("proveedor").all()
    serializer_class = ProductoSerializer


class VarianteProductoViewSet(viewsets.ModelViewSet):
    queryset = VarianteProducto.objects.select_related("producto").all()
    serializer_class = VarianteProductoSerializer


class MovimientoStockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        MovimientoStock.objects
        .select_related("variante_producto")
        .all()
    )
    serializer_class = MovimientoStockSerializer