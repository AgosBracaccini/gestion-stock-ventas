from rest_framework import serializers

from .models import Venta, DetalleVenta
from .services import realizar_venta


class ItemVentaInputSerializer(serializers.Serializer):
    variante_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)


class DetalleVentaSerializer(serializers.ModelSerializer):
    variante = serializers.CharField(
        source="variante_producto",
        read_only=True,
    )

    codigo = serializers.CharField(
        source="variante_producto.producto.codigo",
        read_only=True,
    )

    prenda = serializers.CharField(
        source="variante_producto.producto.prenda",
        read_only=True,
    )

    modelo = serializers.CharField(
        source="variante_producto.producto.modelo",
        read_only=True,
    )

    color = serializers.CharField(
        source="variante_producto.color",
        read_only=True,
    )

    talle = serializers.CharField(
        source="variante_producto.talle",
        read_only=True,
    )

    class Meta:
        model = DetalleVenta
        fields = [
            "id",
            "variante",
            "codigo",
            "prenda",
            "modelo",
            "color",
            "talle",
            "cantidad",
            "precio_unitario",
            "subtotal",
        ]


class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Venta
        fields = [
            "id",
            "fecha",
            "medio_pago",
            "total",
            "nombre_transferencia",
            "apellido_transferencia",
            "telefono_transferencia",
            "transferencia_verificada",
            "detalles",
        ]


class CrearVentaSerializer(serializers.Serializer):
    medio_pago = serializers.ChoiceField(
        choices=Venta.MEDIOS_PAGO
    )

    items = ItemVentaInputSerializer(
        many=True
    )

    nombre_transferencia = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    apellido_transferencia = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    telefono_transferencia = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "La venta debe contener al menos un producto."
            )

        return value

    def validate(self, attrs):
        medio_pago = attrs.get("medio_pago")

        if medio_pago == "TRANSFERENCIA":
            nombre = attrs.get(
                "nombre_transferencia",
                "",
            ).strip()

            apellido = attrs.get(
                "apellido_transferencia",
                "",
            ).strip()

            telefono = attrs.get(
                "telefono_transferencia",
                "",
            ).strip()

            if not nombre:
                raise serializers.ValidationError({
                    "nombre_transferencia":
                        "El nombre es obligatorio para una transferencia."
                })

            if not apellido:
                raise serializers.ValidationError({
                    "apellido_transferencia":
                        "El apellido es obligatorio para una transferencia."
                })

            if not telefono:
                raise serializers.ValidationError({
                    "telefono_transferencia":
                        "El teléfono es obligatorio para una transferencia."
                })

            # Guardamos los valores ya limpios.
            attrs["nombre_transferencia"] = nombre
            attrs["apellido_transferencia"] = apellido
            attrs["telefono_transferencia"] = telefono

        return attrs

    def create(self, validated_data):
        return realizar_venta(
            medio_pago=validated_data["medio_pago"],
            items=validated_data["items"],

            nombre_transferencia=validated_data.get(
                "nombre_transferencia",
                "",
            ),

            apellido_transferencia=validated_data.get(
                "apellido_transferencia",
                "",
            ),

            telefono_transferencia=validated_data.get(
                "telefono_transferencia",
                "",
            ),
        )