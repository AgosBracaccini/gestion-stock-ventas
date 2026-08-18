from django.test import TestCase
from .models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
)
from .services import ingresar_stock
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APITestCase

class IngresoStockTest(TestCase):

    def setUp(self):
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test"
        )

        self.producto = Producto.objects.create(
            codigo="TEST001",
            prenda="Remera",
            modelo="Oversize",
            descripcion="Producto utilizado para tests",
            costo=10000,
            costo_extra=500,
            proveedor=self.proveedor,
            activo=True,
        )

        self.variante = VarianteProducto.objects.create(
            producto=self.producto,
            color="Negro",
            talle="M",
            stock_actual=5,
        )

    def test_ingresar_stock_suma_cantidad(self):
        ingresar_stock(
            variante_id=self.variante.id,
            cantidad=3,
            observacion="Ingreso de prueba",
        )

        self.variante.refresh_from_db()

        self.assertEqual(
            self.variante.stock_actual,
            8
        )

    def test_ingresar_stock_crea_movimiento(self):
        ingresar_stock(
            variante_id=self.variante.id,
            cantidad=3,
            observacion="Ingreso de prueba",
        )

        movimiento = MovimientoStock.objects.get()

        self.assertEqual(
            movimiento.tipo_movimiento,
            "ENTRADA"
        )

        self.assertEqual(
            movimiento.cantidad,
            3
        )

        self.assertEqual(
            movimiento.variante_producto,
            self.variante
        )
        
        
class AutenticacionAPITest(APITestCase):

    def setUp(self):
        self.usuario = User.objects.create_user(
            username="usuario_test",
            password="password_test_123"
        )

    def test_productos_requiere_autenticacion(self):
        response = self.client.get(
            "/api/productos/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_usuario_autenticado_puede_acceder_productos(self):
        token_response = self.client.post(
            "/api/token/",
            {
                "username": "usuario_test",
                "password": "password_test_123",
            },
            format="json",
        )

        access_token = token_response.data["access"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )

        response = self.client.get(
            "/api/productos/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )