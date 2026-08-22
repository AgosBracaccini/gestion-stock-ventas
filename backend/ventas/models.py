from django.db import models
from inventario.models import VarianteProducto

class Venta(models.Model):
    MEDIOS_PAGO = [
        ("EFECTIVO", "Efectivo"),
        ("TRANSFERENCIA", "Transferencia"),
        ("DEBITO", "Tarjeta de débito"),
        ("CREDITO", "Tarjeta de crédito"),
        ("FAST_CRED", "Fast Cred"),
        ("FINAN_YA", "Finan Ya"),
    ]

    fecha = models.DateTimeField(auto_now_add=True)

    medio_pago = models.CharField(
        max_length=20,
        choices=MEDIOS_PAGO
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    
    nombre_transferencia = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    apellido_transferencia = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    telefono_transferencia = models.CharField(
        max_length=30,
        blank=True,
        default="",
    )

    transferencia_verificada = models.BooleanField(
        default=False,
    )

    def __str__(self):
        return f"Venta #{self.id} - {self.fecha}"
    
class DetalleVenta(models.Model):
    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,
        related_name="detalles"
    )

    variante_producto = models.ForeignKey(
        VarianteProducto,
        on_delete=models.PROTECT,
        related_name="detalles_venta"
    )

    cantidad = models.PositiveIntegerField()

    precio_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def __str__(self):
        return (
            f"Venta #{self.venta.id} - "
            f"{self.variante_producto} x {self.cantidad}"
        )