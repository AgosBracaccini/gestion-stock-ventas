from django.test import TestCase

from .importar_excel import procesar_fila_stock
from .models import Producto, Proveedor, VarianteProducto
from .normalizacion import normalizar_color, normalizar_talle
from .services import ingresar_mercaderia


class NormalizacionTest(TestCase):
    def test_normalizar_color(self):
        self.assertEqual(normalizar_color("  azul   MARINO "), "Azul marino")
        self.assertEqual(normalizar_color("NEGRO"), "Negro")
        self.assertEqual(normalizar_color(None), "")

    def test_normalizar_talle(self):
        self.assertEqual(normalizar_talle(" xl "), "XL")
        self.assertEqual(normalizar_talle("38"), "38")

    def test_ingreso_no_duplica_variantes(self):
        proveedor = Proveedor.objects.create(nombre="Prov")
        for color, talle in [("azul", "xl"), ("Azul ", "XL"), ("AZUL", "Xl")]:
            ingresar_mercaderia(
                codigo="A1", prenda="Remera", modelo="Lisa", color=color,
                talle=talle, cantidad=2, costo=1000, costo_extra=0,
                proveedor=proveedor,
            )
        self.assertEqual(VarianteProducto.objects.count(), 1)
        variante = VarianteProducto.objects.get()
        self.assertEqual((variante.color, variante.talle), ("Azul", "XL"))
        self.assertEqual(variante.stock_actual, 6)

    def test_importar_stock_no_duplica_variantes(self):
        proveedor = Proveedor.objects.create(nombre="Prov")
        Producto.objects.create(
            codigo="B1", prenda="Buzo", modelo="Canguro", costo=1000,
            costo_extra=0, proveedor=proveedor,
        )
        ok1, _, creado1 = procesar_fila_stock({"codigo": "B1", "color": "negro", "talle": "m", "cantidad": 3})
        ok2, _, creado2 = procesar_fila_stock({"codigo": "B1", "color": "NEGRO", "talle": "M", "cantidad": 5})
        self.assertTrue(ok1 and ok2)
        self.assertTrue(creado1)
        self.assertFalse(creado2)
        self.assertEqual(VarianteProducto.objects.count(), 1)
        self.assertEqual(VarianteProducto.objects.get().stock_actual, 5)