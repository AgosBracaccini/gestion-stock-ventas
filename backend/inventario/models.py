from django.db import models
from decimal import Decimal

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
        return (self.costo * Decimal("2.5")) + self.costo_extra

    @property
    def precio_debito(self):
        return self.precio_tarjeta * Decimal("0.85")

    @property
    def precio_efectivo(self):
        return self.precio_tarjeta * Decimal("0.80")

    @property
    def precio_finan_ya(self):
        return self.precio_efectivo * Decimal("1.05")
    
    @property
    def precio_fast_cred(self):
        return self.precio_efectivo
    
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