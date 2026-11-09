from django.test import TestCase

from .models import MovimientoStock, Proveedor
from .serializers import MovimientoStockSerializer
from .services import ingresar_mercaderia


class MovimientoSerializerTest(TestCase):
    def test_incluye_datos_legibles_de_la_variante(self):
        proveedor = Proveedor.objects.create(nombre="Prov")
        ingresar_mercaderia(
            codigo="M1", prenda="Remera", modelo="Lisa", color="azul",
            talle="xl", cantidad=2, costo=1000, costo_extra=0,
            proveedor=proveedor,
        )

        datos = MovimientoStockSerializer(MovimientoStock.objects.get()).data

        self.assertEqual(datos["codigo"], "M1")
        self.assertEqual(datos["producto_descripcion"], "Remera Lisa")
        self.assertEqual(datos["color"], "Azul")
        self.assertEqual(datos["talle"], "XL")
        self.assertEqual(datos["tipo_movimiento"], "ENTRADA")
        self.assertEqual(datos["cantidad"], 2)