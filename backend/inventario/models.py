from django.db import models
from decimal import Decimal
import uuid

class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name="productos"
    )
    codigo = models.CharField(max_length=20, unique=True)
    prenda = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    costo = models.DecimalField(max_digits=12, decimal_places=2)
    costo_extra = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    activo = models.BooleanField(default=True)
    
    @property
    def precio_tarjeta(self):
        config = ConfiguracionPrecios.obtener()

        return (
            self.costo * config.multiplicador_tarjeta
        ) + self.costo_extra


    @property
    def precio_debito(self):
        config = ConfiguracionPrecios.obtener()

        porcentaje = (
            Decimal("1.00")
            - config.descuento_debito / Decimal("100")
        )

        return self.precio_tarjeta * porcentaje


    @property
    def precio_efectivo(self):
        config = ConfiguracionPrecios.obtener()

        porcentaje = (
            Decimal("1.00")
            - config.descuento_efectivo / Decimal("100")
        )

        return self.precio_tarjeta * porcentaje


    @property
    def precio_fast_cred(self):
        return self.precio_efectivo


    @property
    def precio_finan_ya(self):
        config = ConfiguracionPrecios.obtener()

        porcentaje = (
            Decimal("1.00")
            + config.recargo_finan_ya / Decimal("100")
        )

        return self.precio_efectivo * porcentaje
    
    def __str__(self):
        return f"{self.codigo} - {self.prenda} {self.modelo}"
    
class VarianteProducto(models.Model):
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name="variantes"
    )
    color = models.CharField(max_length=50)
    talle = models.CharField(max_length=20)
    stock_actual = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["producto", "color", "talle"],
                name="unique_producto_color_talle"
            )
        ]

    def __str__(self):
        return f"{self.producto.codigo} - {self.color} - {self.talle}"
    
class MovimientoStock(models.Model):
    TIPO_MOVIMIENTO = [
        ("ENTRADA", "Entrada"),
        ("VENTA", "Venta"),
        ("AJUSTE", "Ajuste"),
    ]

    variante_producto = models.ForeignKey(
        VarianteProducto,
        on_delete=models.PROTECT,
        related_name="movimientos_stock"
    )

    tipo_movimiento = models.CharField(
        max_length=10,
        choices=TIPO_MOVIMIENTO
    )
    
    cantidad = models.PositiveIntegerField()

    fecha = models.DateTimeField(auto_now_add=True)

    observacion = models.TextField(
        blank=True
    )

    def __str__(self):
        return (
            f"{self.tipo_movimiento} - "
            f"{self.variante_producto} - "
            f"{self.cantidad}"
        )
        

class ConfiguracionPrecios(models.Model):
    multiplicador_tarjeta = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("2.50"),
    )

    descuento_debito = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("15.00"),
    )

    descuento_efectivo = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("20.00"),
    )

    recargo_finan_ya = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("5.00"),
    )

    actualizado = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Configuración de precios"
        verbose_name_plural = "Configuración de precios"

    def __str__(self):
        return "Configuración general de precios"

    @classmethod
    def obtener(cls):
        configuracion, _ = cls.objects.get_or_create(
            pk=1
        )
        return configuracion
    
    
class ConfiguracionTienda(models.Model):
    COLORES_DISPONIBLES = [
        ("rosa", "Rosa"),
        ("celeste", "Celeste"),
        ("verde", "Verde"),
        ("violeta", "Violeta"),
        ("mostaza", "Mostaza"),
        ("gris", "Gris"),
    ]

    nombre = models.CharField(max_length=100, default="Mi Tienda")
    color = models.CharField(max_length=20, choices=COLORES_DISPONIBLES, default="rosa")
    
    INTENSIDADES_DISPONIBLES = [
        ("suave", "Suave"),
        ("medio", "Medio"),
        ("fuerte", "Fuerte"),
    ]

    intensidad = models.CharField(
        max_length=20,
        choices=INTENSIDADES_DISPONIBLES,
        default="medio",
    )
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración de tienda"
        verbose_name_plural = "Configuración de tienda"

    def __str__(self):
        return f"Configuración de {self.nombre}"

    @classmethod
    def obtener(cls):
        configuracion, _ = cls.objects.get_or_create(pk=1)
        return configuracion
    
class ConfiguracionEtiqueta(models.Model):
    FORMAS_DISPONIBLES = [
        ("rectangular", "Rectangular"),
        ("cuadrada", "Cuadrada"),
        ("circular", "Circular"),
    ]

    forma = models.CharField(
        max_length=20,
        choices=FORMAS_DISPONIBLES,
        default="rectangular",
    )

    # Para "circular" se usa solo ancho_cm como diámetro.
    ancho_cm = models.DecimalField(max_digits=4, decimal_places=1, default=5.0)
    alto_cm = models.DecimalField(max_digits=4, decimal_places=1, default=3.0)

    color_fondo = models.CharField(
        max_length=7,
        default="#ffffff",
    )

    # Segundo color de fondo, para degradé. Si es igual al primero, el
    # fondo se ve como un color plano (sin necesidad de un campo aparte).
    color_fondo_2 = models.CharField(
        max_length=7,
        default="#ffffff",
    )

    # Subtítulo opcional debajo del nombre de la tienda (ej: "INDUMENTARIA").
    subtitulo = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    # Color de letra del código/talle (dentro de los recuadros).
    color_texto = models.CharField(
        max_length=7,
        default="#1a1a1a",
    )

    # Color de letra del nombre de la tienda.
    color_texto_tienda = models.CharField(
        max_length=7,
        default="#1a1a1a",
    )

    # Color de fondo de los dos recuadros (código y talle).
    color_rectangulos = models.CharField(
        max_length=7,
        default="#f2f2f2",
    )

    ESTILOS_DISPONIBLES = [
        ("simple", "Simple"),
        ("con_borde", "Con borde"),
        ("bordes_suaves", "Bordes suaves"),
        ("relleno_solido", "Relleno sólido"),
        ("marco_doble", "Marco doble"),
    ]

    estilo = models.CharField(
        max_length=20,
        choices=ESTILOS_DISPONIBLES,
        default="simple",
    )

    FUENTES_DISPONIBLES = [
        ("georgia", "Georgia"),
        ("times", "Times New Roman"),
        ("arial", "Arial"),
        ("verdana", "Verdana"),
        ("courier", "Courier New"),
        ("trebuchet", "Trebuchet MS"),
    ]

    fuente = models.CharField(
        max_length=20,
        choices=FUENTES_DISPONIBLES,
        default="arial",
    )

    # Tamaños de letra, en puntos (pt), para imprimir de forma consistente.
    tamano_texto_tienda = models.PositiveSmallIntegerField(
        default=10,
    )

    tamano_texto_codigo = models.PositiveSmallIntegerField(
        default=14,
    )
    POSICIONES_DISPONIBLES = [
        ("arriba_izquierda", "Arriba izquierda"),
        ("arriba_centro", "Arriba centro"),
        ("arriba_derecha", "Arriba derecha"),
        ("centro_izquierda", "Centro izquierda"),
        ("centro", "Centro"),
        ("centro_derecha", "Centro derecha"),
        ("abajo_izquierda", "Abajo izquierda"),
        ("abajo_centro", "Abajo centro"),
        ("abajo_derecha", "Abajo derecha"),
    ]

    posicion_nombre = models.CharField(
        max_length=20,
        choices=POSICIONES_DISPONIBLES,
        default="arriba_centro",
    )

    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración de etiqueta"
        verbose_name_plural = "Configuración de etiqueta"

    def __str__(self):
        return f"Etiqueta {self.forma} {self.ancho_cm}x{self.alto_cm}cm"

    @classmethod
    def obtener(cls):
        configuracion, _ = cls.objects.get_or_create(pk=1)
        return configuracion

class Caja(models.Model):
    """
    Unidad de almacenamiento en depósito. Cada caja tiene un código
    público (UUID, no adivinable) que se imprime como QR y permite
    consultar su contenido sin necesidad de iniciar sesión.
    """

    codigo_publico = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )

    nombre = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    creado = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-creado"]

    def __str__(self):
        etiqueta = f"Caja #{self.id}"
        if self.nombre:
            etiqueta += f" — {self.nombre}"
        return etiqueta


class CajaItem(models.Model):
    caja = models.ForeignKey(
        Caja,
        related_name="items",
        on_delete=models.CASCADE,
    )

    variante = models.ForeignKey(
        VarianteProducto,
        related_name="items_en_cajas",
        on_delete=models.PROTECT,
    )

    cantidad = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.variante} x{self.cantidad} en {self.caja}"