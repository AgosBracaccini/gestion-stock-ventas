from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
    ConfiguracionPrecios,
    ConfiguracionTienda,
    ConfiguracionEtiqueta,
    Caja,
)

from .serializers import (
    ProveedorSerializer,
    ProductoSerializer,
    VarianteProductoSerializer,
    MovimientoStockSerializer,
    IngresoStockSerializer,
    IngresoMercaderiaSerializer,
    ConfiguracionPreciosSerializer,
    ConfiguracionTiendaSerializer,
    ConfiguracionEtiquetaSerializer,
    CajaSerializer,
)

from .services import (
    ingresar_stock,
    ingresar_mercaderia,
)

from .importar_excel import (
    importar_precios_desde_excel,
    importar_stock_desde_excel,
    procesar_fila_precio,
    procesar_fila_stock,
)

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

    filter_backends = [
        filters.SearchFilter,
    ]

    search_fields = [
        "nombre",
    ]


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = (
        Producto.objects
        .select_related("proveedor")
        .all()
    )

    serializer_class = ProductoSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]

    filterset_fields = [
        "activo",
        "proveedor",
    ]

    search_fields = [
        "codigo",
        "prenda",
        "modelo",
        "descripcion",
        "proveedor__nombre",
    ]


class VarianteProductoViewSet(viewsets.ModelViewSet):
    queryset = (
        Producto.objects
        .select_related("proveedor")
        .prefetch_related("variantes")
        .all()
    )

    serializer_class = VarianteProductoSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]

    filterset_fields = [
        "color",
        "talle",
        "producto",
    ]

    search_fields = [
        "producto__codigo",
        "producto__prenda",
        "producto__modelo",
        "color",
        "talle",
    ]

    @action(
        detail=False,
        methods=["post"],
        url_path="ingresar-stock"
    )
    def ingresar_stock(self, request):
        serializer = IngresoStockSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        variante = ingresar_stock(
            variante_id=serializer.validated_data["variante_id"],
            cantidad=serializer.validated_data["cantidad"],
            observacion=serializer.validated_data["observacion"],
        )

        respuesta = VarianteProductoSerializer(
            variante
        )

        return Response(
            respuesta.data,
            status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="ingresar-mercaderia"
    )
    def ingresar_mercaderia_view(self, request):
        serializer = IngresoMercaderiaSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:
            proveedor = Proveedor.objects.get(
                id=serializer.validated_data["proveedor_id"]
            )
        except Proveedor.DoesNotExist:
            return Response(
                {
                    "detail": "El proveedor indicado no existe."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        producto, variante, producto_creado, variante_creada = (
            ingresar_mercaderia(
                codigo=serializer.validated_data["codigo"],
                prenda=serializer.validated_data["prenda"],
                modelo=serializer.validated_data["modelo"],
                descripcion=serializer.validated_data["descripcion"],
                color=serializer.validated_data["color"],
                talle=serializer.validated_data["talle"],
                cantidad=serializer.validated_data["cantidad"],
                costo=serializer.validated_data["costo"],
                costo_extra=serializer.validated_data["costo_extra"],
                proveedor=proveedor,
            )
        )

        return Response(
            {
                "producto_creado": producto_creado,
                "variante_creada": variante_creada,
                "producto": ProductoSerializer(producto).data,
                "variante": VarianteProductoSerializer(variante).data,
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="sin-stock"
    )
    def sin_stock(self, request):
        variantes = self.get_queryset().filter(
            stock_actual=0
        )

        serializer = self.get_serializer(
            variantes,
            many=True
        )

        return Response(serializer.data)

    @action(
        detail=False,
        methods=["get"],
        url_path="stock-bajo"
    )
    def stock_bajo(self, request):
        variantes = self.get_queryset().filter(
            stock_actual__gt=0,
            stock_actual__lte=3
        )

        serializer = self.get_serializer(
            variantes,
            many=True
        )

        return Response(serializer.data)


class MovimientoStockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        MovimientoStock.objects
        .select_related(
            "variante_producto",
            "variante_producto__producto",
        )
        .all()
    )

    serializer_class = MovimientoStockSerializer
    
class ConfiguracionPreciosViewSet(
    viewsets.ViewSet
):
    def list(self, request):
        configuracion = (
            ConfiguracionPrecios.obtener()
        )

        serializer = (
            ConfiguracionPreciosSerializer(
                configuracion
            )
        )

        return Response(
            serializer.data
        )

    def partial_update(
        self,
        request,
        pk=None,
    ):
        configuracion = (
            ConfiguracionPrecios.obtener()
        )

        serializer = (
            ConfiguracionPreciosSerializer(
                configuracion,
                data=request.data,
                partial=True,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )
        
class ConfiguracionTiendaViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action == "list":
            return [AllowAny()]
        return super().get_permissions()
    
    def list(self, request):
        configuracion = ConfiguracionTienda.obtener()
        serializer = ConfiguracionTiendaSerializer(configuracion)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        configuracion = ConfiguracionTienda.obtener()
        serializer = ConfiguracionTiendaSerializer(configuracion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
class ConfiguracionEtiquetaViewSet(viewsets.ViewSet):
    def list(self, request):
        configuracion = ConfiguracionEtiqueta.obtener()
        serializer = ConfiguracionEtiquetaSerializer(configuracion)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        configuracion = ConfiguracionEtiqueta.obtener()
        serializer = ConfiguracionEtiquetaSerializer(configuracion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
class CajaViewSet(viewsets.ModelViewSet):
    queryset = (
        Caja.objects
        .prefetch_related("items__variante__producto")
        .all()
    )

    serializer_class = CajaSerializer

    # La consulta pública (por código UUID) no requiere login: es lo que
    # se abre al escanear el QR pegado en la caja. Todo lo demás (listar,
    # crear, editar, borrar cajas) sigue requiriendo sesión iniciada.
    def get_permissions(self):
        if self.action == "publica":
            return [AllowAny()]
        return super().get_permissions()

    @action(
        detail=False,
        methods=["get"],
        url_path="publica/(?P<codigo_publico>[^/.]+)",
    )
    def publica(self, request, codigo_publico=None):
        caja = get_object_or_404(
            self.get_queryset(),
            codigo_publico=codigo_publico,
        )

        serializer = self.get_serializer(caja)

        return Response(serializer.data)


@api_view(["POST"])
@parser_classes([MultiPartParser])
def importar_precios(request):
    archivo = request.FILES.get("archivo")
    if not archivo:
        return Response(
            {"detail": "No se envió ningún archivo."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    resultado = importar_precios_desde_excel(archivo)
    return Response(resultado)


@api_view(["POST"])
@parser_classes([MultiPartParser])
def importar_stock(request):
    archivo = request.FILES.get("archivo")
    if not archivo:
        return Response(
            {"detail": "No se envió ningún archivo."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    resultado = importar_stock_desde_excel(archivo)
    return Response(resultado)


@api_view(["POST"])
def corregir_precio(request):
    ok, mensaje, creado = procesar_fila_precio(request.data)

    if not ok:
        return Response({"detail": mensaje}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"creado": creado})


@api_view(["POST"])
def corregir_stock(request):
    ok, mensaje, creado = procesar_fila_stock(request.data)

    if not ok:
        return Response({"detail": mensaje}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"creado": creado})