from django.test import TestCase

from .models import Producto, Proveedor
from .serializers import ProveedorSerializer


class ProveedorSerializerTest(TestCase):
    def test_rechaza_nombre_repetido_sin_importar_mayusculas(self):
        Proveedor.objects.create(nombre="Cielo")
        serializer = ProveedorSerializer(data={"nombre": "  cielo "})
        self.assertFalse(serializer.is_valid())
        self.assertIn("nombre", serializer.errors)

    def test_permite_guardar_el_mismo_proveedor_sin_cambiar_nombre(self):
        proveedor = Proveedor.objects.create(nombre="Cielo")
        serializer = ProveedorSerializer(proveedor, data={"nombre": "Cielo"})
        self.assertTrue(serializer.is_valid())

    def test_informa_cantidad_de_productos(self):
        proveedor = Proveedor.objects.create(nombre="Cielo")
        Producto.objects.create(
            codigo="P1", prenda="Remera", modelo="Lisa", costo=1000,
            costo_extra=0, proveedor=proveedor,
        )
        self.assertEqual(ProveedorSerializer(proveedor).data["cantidad_productos"], 1)