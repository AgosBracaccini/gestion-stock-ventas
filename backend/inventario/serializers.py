from rest_framework import serializers

from .models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
)


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = "__all__"


class ProductoSerializer(serializers.ModelSerializer):
    precio_tarjeta = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    precio_debito = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    precio_efectivo = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    precio_fast_cred = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    precio_finan_ya = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Producto
        fields = [
            "id",
            "proveedor",
            "codigo",
            "prenda",
            "modelo",
            "descripcion",
            "costo",
            "costo_extra",
            "activo",
            "precio_tarjeta",
            "precio_debito",
            "precio_efectivo",
            "precio_fast_cred",
            "precio_finan_ya",
        ]


class VarianteProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VarianteProducto
        fields = "__all__"


class MovimientoStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoStock
        fields = "__all__"
    

class IngresoStockSerializer(serializers.Serializer):
    variante_id = serializers.IntegerField()

    cantidad = serializers.IntegerField(
        min_value=1
    )

    observacion = serializers.CharField(
        required=False,
        allow_blank=True,
        default=""
    )
    
class IngresoMercaderiaSerializer(serializers.Serializer):
    codigo = serializers.CharField(
        max_length=20
    )

    prenda = serializers.CharField(
        max_length=100
    )

    modelo = serializers.CharField(
        max_length=100
    )

    descripcion = serializers.CharField(
        required=False,
        allow_blank=True,
        default=""
    )

    color = serializers.CharField(
        max_length=50
    )

    talle = serializers.CharField(
        max_length=20
    )

    cantidad = serializers.IntegerField(
        min_value=1
    )

    costo = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    costo_extra = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        default=0
    )

    proveedor_id = serializers.IntegerField()