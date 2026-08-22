from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Venta
from .serializers import (
    CrearVentaSerializer,
    VentaSerializer,
)

from .services import (
    realizar_venta,
    obtener_resumen_dashboard,
)

class VentaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Venta.objects
        .prefetch_related(
            "detalles__variante_producto__producto"
        )
        .all()
        .order_by("-fecha")
    )

    serializer_class = VentaSerializer
    
    @extend_schema(
        request=CrearVentaSerializer,
        responses={
            201: VentaSerializer,
            400: {
                "description": "Datos inválidos o error de negocio."
            },
            401: {
                "description": "Usuario no autenticado o token inválido."
            },
        },
    )
    
    def create(self, request, *args, **kwargs):
        serializer = CrearVentaSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        venta = serializer.save()

        respuesta = VentaSerializer(venta)

        return Response(
            respuesta.data,
            status=status.HTTP_201_CREATED
        )
        
    @action(
        detail=False,
        methods=["get"],
        url_path="resumen",
    )
    def resumen(self, request):
        data = obtener_resumen_dashboard()

        return Response(
            data,
            status=status.HTTP_200_OK,
        )
    
    @action(
        detail=True,
        methods=["patch"],
        url_path="verificar-transferencia",
    )
    def verificar_transferencia(self, request, pk=None):
        venta = self.get_object()

        if venta.medio_pago != "TRANSFERENCIA":
            return Response(
                {
                    "detail": (
                        "Esta venta no corresponde "
                        "a una transferencia."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        venta.transferencia_verificada = True
        venta.save(
            update_fields=[
                "transferencia_verificada"
            ]
        )

        serializer = VentaSerializer(venta)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )