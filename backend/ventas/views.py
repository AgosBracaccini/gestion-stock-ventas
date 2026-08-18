from rest_framework import status, viewsets
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Venta
from .serializers import (
    CrearVentaSerializer,
    VentaSerializer,
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