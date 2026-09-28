import re

from rest_framework import serializers

from .models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
    ConfiguracionPrecios,
    ConfiguracionTienda,
    ConfiguracionEtiqueta,
    Caja,
    CajaItem,
)

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = "__all__"

class VarianteProductoNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = VarianteProducto
        fields = [
            "id",
            "producto",
            "color",
            "talle",
            "stock_actual",
        ]

class ProductoSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(
        source="proveedor.nombre",
        read_only=True,
    )

    variantes = VarianteProductoNestedSerializer(
        many=True,
        read_only=True,
    )
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
            "proveedor_nombre",
            "codigo",
            "prenda",
            "modelo",
            "descripcion",
            "costo",
            "costo_extra",
            "activo",
            "variantes",
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
    
class ConfiguracionPreciosSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ConfiguracionPrecios
        fields = [
            "id",
            "multiplicador_tarjeta",
            "descuento_debito",
            "descuento_efectivo",
            "recargo_finan_ya",
            "actualizado",
        ]

        read_only_fields = [
            "id",
            "actualizado",
        ]

    def validate_multiplicador_tarjeta(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "El multiplicador debe ser mayor a cero."
            )

        return value

    def validate_descuento_debito(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "El descuento debe estar entre 0 y 100."
            )

        return value

    def validate_descuento_efectivo(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "El descuento debe estar entre 0 y 100."
            )

        return value

    def validate_recargo_finan_ya(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "El recargo no puede ser negativo."
            )

        return value
    
class ConfiguracionTiendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionTienda
        fields = ["id", "nombre", "color", "actualizado"]
        read_only_fields = ["id", "actualizado"]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return value.strip()
    
class ConfiguracionEtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionEtiqueta
        fields = ["id", "forma", "ancho_cm", "alto_cm",             "color_fondo",
            "color_fondo_2",
            "subtitulo",
            "color_texto",
            "color_texto_tienda",
            "color_rectangulos",
            "estilo",
            "fuente",
            "tamano_texto_tienda",
            "tamano_texto_codigo",
            "posicion_nombre", "actualizado"]
        read_only_fields = ["id", "actualizado"]

    def _validar_color(self, value):
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
            raise serializers.ValidationError("El color debe tener formato hexadecimal, por ejemplo #ffffff.")
        return value.lower()

    def validate_color_fondo(self, value):
        return self._validar_color(value)

    def validate_color_fondo_2(self, value):
        return self._validar_color(value)

    def validate_color_texto(self, value):
        return self._validar_color(value)

    def validate_color_texto_tienda(self, value):
        return self._validar_color(value)

    def validate_color_rectangulos(self, value):
        return self._validar_color(value)

    def _validar_tamano(self, value):
        if value < 6 or value > 72:
            raise serializers.ValidationError("El tamaño de letra debe estar entre 6 y 72.")
        return value

    def validate_tamano_texto_tienda(self, value):
        return self._validar_tamano(value)

    def validate_tamano_texto_codigo(self, value):
        return self._validar_tamano(value)

    def validate_ancho_cm(self, value):
        if value <= 0:
            raise serializers.ValidationError("El ancho debe ser mayor a cero.")
        return value

    def validate_alto_cm(self, value):
        if value <= 0:
            raise serializers.ValidationError("El alto debe ser mayor a cero.")
        return value

class VarianteEnCajaSerializer(serializers.ModelSerializer):
    """Vista de lectura, liviana, de una variante dentro del contenido de una caja."""
    producto_codigo = serializers.CharField(source="producto.codigo", read_only=True)
    prenda = serializers.CharField(source="producto.prenda", read_only=True)
    modelo = serializers.CharField(source="producto.modelo", read_only=True)

    class Meta:
        model = VarianteProducto
        fields = ["id", "producto_codigo", "prenda", "modelo", "color", "talle"]


class CajaItemSerializer(serializers.ModelSerializer):
    variante_id = serializers.IntegerField(write_only=True)
    variante = VarianteEnCajaSerializer(read_only=True)

    class Meta:
        model = CajaItem
        fields = ["id", "variante_id", "variante", "cantidad"]

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "La cantidad debe ser al menos 1."
            )
        return value

    def validate_variante_id(self, value):
        if not VarianteProducto.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                "La variante indicada no existe."
            )
        return value


class CajaSerializer(serializers.ModelSerializer):
    items = CajaItemSerializer(many=True)
    numero = serializers.SerializerMethodField()

    class Meta:
        model = Caja
        fields = ["id", "numero", "nombre", "codigo_publico", "creado", "items"]
        read_only_fields = ["id", "numero", "codigo_publico", "creado"]

    def get_numero(self, obj):
        return obj.id

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "La caja debe tener al menos un artículo."
            )
        return value

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        caja = Caja.objects.create(**validated_data)
        for item in items_data:
            variante_id = item.pop("variante_id")
            CajaItem.objects.create(caja=caja, variante_id=variante_id, **item)
        return caja

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        instance.nombre = validated_data.get("nombre", instance.nombre)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                variante_id = item.pop("variante_id")
                CajaItem.objects.create(caja=instance, variante_id=variante_id, **item)

        return instance