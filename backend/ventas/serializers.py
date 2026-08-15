from rest_framework import serializers

from .models import Venta, DetalleVenta
from .services import realizar_venta


class ItemVentaInputSerializer(serializers.Serializer):
    variante_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)


class DetalleVentaSerializer(serializers.ModelSerializer):
    variante = serializers.CharField(
        source="variante_producto",
        read_only=True
    )

    class Meta:
        model = DetalleVenta
        fields = [
            "id",
            "variante",
            "cantidad",
            "precio_unitario",
            "subtotal",
        ]


class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Venta
        fields = [
            "id",
            "fecha",
            "medio_pago",
            "total",
            "detalles",
        ]


class CrearVentaSerializer(serializers.Serializer):
    medio_pago = serializers.ChoiceField(
        choices=Venta.MEDIOS_PAGO
    )

    items = ItemVentaInputSerializer(
        many=True
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "La venta debe contener al menos un producto."
            )

        return value

    def create(self, validated_data):
        return realizar_venta(
            medio_pago=validated_data["medio_pago"],
            items=validated_data["items"],
        )