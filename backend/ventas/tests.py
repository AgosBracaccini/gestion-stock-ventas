from django.core.exceptions import ValidationError
from django.test import TestCase

from inventario.models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
)

from .models import Venta, DetalleVenta
from .services import realizar_venta


class VentaServiceTest(TestCase):

    def setUp(self):
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test"
        )

        self.producto = Producto.objects.create(
            codigo="TEST001",
            prenda="Jean",
            modelo="Mom",
            descripcion="Producto para tests",
            costo=10000,
            costo_extra=500,
            proveedor=self.proveedor,
            activo=True,
        )

        self.variante = VarianteProducto.objects.create(
            producto=self.producto,
            color="Azul",
            talle="40",
            stock_actual=5,
        )

    def test_venta_valida_descuenta_stock(self):
        venta = realizar_venta(
            medio_pago="EFECTIVO",
            items=[
                {
                    "variante_id": self.variante.id,
                    "cantidad": 2,
                }
            ],
        )

        self.variante.refresh_from_db()

        self.assertEqual(
            self.variante.stock_actual,
            3
        )

        self.assertEqual(
            Venta.objects.count(),
            1
        )

        self.assertEqual(
            DetalleVenta.objects.count(),
            1
        )

        self.assertEqual(
            venta.detalles.count(),
            1
        )

    def test_venta_valida_crea_movimiento_stock(self):
        realizar_venta(
            medio_pago="EFECTIVO",
            items=[
                {
                    "variante_id": self.variante.id,
                    "cantidad": 2,
                }
            ],
        )

        movimiento = MovimientoStock.objects.get()

        self.assertEqual(
            movimiento.tipo_movimiento,
            "VENTA"
        )

        self.assertEqual(
            movimiento.cantidad,
            2
        )

        self.assertEqual(
            movimiento.variante_producto,
            self.variante
        )

    def test_venta_sin_stock_es_rechazada(self):
        with self.assertRaises(ValidationError):
            realizar_venta(
                medio_pago="EFECTIVO",
                items=[
                    {
                        "variante_id": self.variante.id,
                        "cantidad": 100,
                    }
                ],
            )

        self.variante.refresh_from_db()

        self.assertEqual(
            self.variante.stock_actual,
            5
        )

        self.assertEqual(
            Venta.objects.count(),
            0
        )

        self.assertEqual(
            DetalleVenta.objects.count(),
            0
        )

        self.assertEqual(
            MovimientoStock.objects.count(),
            0
        )

    def test_rollback_si_un_item_falla(self):
        segunda_variante = VarianteProducto.objects.create(
            producto=self.producto,
            color="Negro",
            talle="42",
            stock_actual=1,
        )

        with self.assertRaises(ValidationError):
            realizar_venta(
                medio_pago="DEBITO",
                items=[
                    {
                        "variante_id": self.variante.id,
                        "cantidad": 2,
                    },
                    {
                        "variante_id": segunda_variante.id,
                        "cantidad": 50,
                    },
                ],
            )

        self.variante.refresh_from_db()
        segunda_variante.refresh_from_db()

        self.assertEqual(
            self.variante.stock_actual,
            5
        )

        self.assertEqual(
            segunda_variante.stock_actual,
            1
        )

        self.assertEqual(
            Venta.objects.count(),
            0
        )

        self.assertEqual(
            DetalleVenta.objects.count(),
            0
        )

        self.assertEqual(
            MovimientoStock.objects.count(),
            0
        )