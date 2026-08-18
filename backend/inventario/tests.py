from django.test import TestCase
from .models import (
    Proveedor,
    Producto,
    VarianteProducto,
    MovimientoStock,
)
from .services import (
    ingresar_stock,
    ingresar_mercaderia,
)
from django.contrib.auth.models import User
from decimal import Decimal
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

class IngresoMercaderiaTest(TestCase):

    def setUp(self):
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test"
        )

    def test_producto_nuevo_crea_producto_y_variante(self):
        producto, variante, producto_creado, variante_creada = (
            ingresar_mercaderia(
                codigo="TEST100",
                prenda="Remera",
                modelo="Oversize",
                descripcion="Remera de prueba",
                color="Negro",
                talle="M",
                cantidad=5,
                costo=10000,
                costo_extra=500,
                proveedor=self.proveedor,
            )
        )

        self.assertTrue(producto_creado)
        self.assertTrue(variante_creada)

        self.assertEqual(
            Producto.objects.count(),
            1
        )

        self.assertEqual(
            VarianteProducto.objects.count(),
            1
        )

        self.assertEqual(
            variante.stock_actual,
            5
        )

        self.assertEqual(
            MovimientoStock.objects.count(),
            1
        )

    def test_producto_existente_crea_variante_nueva(self):
        producto = Producto.objects.create(
            codigo="TEST200",
            prenda="Jean",
            modelo="Mom",
            descripcion="Jean de prueba",
            costo=15000,
            costo_extra=1000,
            proveedor=self.proveedor,
            activo=True,
        )

        producto_resultado, variante, producto_creado, variante_creada = (
            ingresar_mercaderia(
                codigo="TEST200",
                prenda="Jean",
                modelo="Mom",
                descripcion="Jean de prueba",
                color="Azul",
                talle="40",
                cantidad=3,
                costo=15000,
                costo_extra=1000,
                proveedor=self.proveedor,
            )
        )

        self.assertFalse(producto_creado)
        self.assertTrue(variante_creada)

        self.assertEqual(
            Producto.objects.count(),
            1
        )

        self.assertEqual(
            producto_resultado.id,
            producto.id
        )

        self.assertEqual(
            variante.stock_actual,
            3
        )

    def test_variante_existente_suma_stock(self):
        producto = Producto.objects.create(
            codigo="TEST300",
            prenda="Pantalon",
            modelo="Cargo",
            descripcion="Pantalón de prueba",
            costo=12000,
            costo_extra=500,
            proveedor=self.proveedor,
            activo=True,
        )

        variante = VarianteProducto.objects.create(
            producto=producto,
            color="Negro",
            talle="M",
            stock_actual=4,
        )

        producto_resultado, variante_resultado, producto_creado, variante_creada = (
            ingresar_mercaderia(
                codigo="TEST300",
                prenda="Pantalon",
                modelo="Cargo",
                descripcion="Pantalón de prueba",
                color="Negro",
                talle="M",
                cantidad=3,
                costo=12000,
                costo_extra=500,
                proveedor=self.proveedor,
            )
        )

        variante_resultado.refresh_from_db()

        self.assertFalse(producto_creado)
        self.assertFalse(variante_creada)

        self.assertEqual(
            VarianteProducto.objects.count(),
            1
        )

        self.assertEqual(
            variante_resultado.stock_actual,
            7
        )

        self.assertEqual(
            MovimientoStock.objects.count(),
            1
        )

    def test_reposicion_no_modifica_datos_del_producto(self):
        producto = Producto.objects.create(
            codigo="TEST400",
            prenda="Remera",
            modelo="Clasica",
            descripcion="Producto original",
            costo=10000,
            costo_extra=500,
            proveedor=self.proveedor,
            activo=True,
        )

        VarianteProducto.objects.create(
            producto=producto,
            color="Blanco",
            talle="S",
            stock_actual=2,
        )

        ingresar_mercaderia(
            codigo="TEST400",

            # Simulamos datos incorrectos
            prenda="Campera",
            modelo="Puffer",
            descripcion="ESTO NO DEBE GUARDARSE",

            color="Blanco",
            talle="S",
            cantidad=2,
            costo=99999,
            costo_extra=99999,
            proveedor=self.proveedor,
        )

        producto.refresh_from_db()

        self.assertEqual(
            producto.prenda,
            "Remera"
        )

        self.assertEqual(
            producto.modelo,
            "Clasica"
        )

        self.assertEqual(
            producto.descripcion,
            "Producto original"
        )

        self.assertEqual(
            producto.costo,
            10000
        )

        self.assertEqual(
            producto.costo_extra,
            500
        )

class PrecioProductoTest(TestCase):

    def setUp(self):
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test Precios"
        )

        self.producto = Producto.objects.create(
            codigo="PRECIO001",
            prenda="Remera",
            modelo="Lino",
            descripcion="Producto para probar precios",
            costo=Decimal("7280.00"),
            costo_extra=Decimal("1150.00"),
            proveedor=self.proveedor,
            activo=True,
        )

    def test_precio_tarjeta(self):
        self.assertEqual(
            self.producto.precio_tarjeta,
            Decimal("19350.00")
        )

    def test_precio_debito(self):
        self.assertEqual(
            self.producto.precio_debito,
            Decimal("16447.50")
        )

    def test_precio_efectivo(self):
        self.assertEqual(
            self.producto.precio_efectivo,
            Decimal("15480.00")
        )

    def test_precio_fast_cred(self):
        self.assertEqual(
            self.producto.precio_fast_cred,
            Decimal("15480.00")
        )

    def test_precio_finan_ya(self):
        self.assertEqual(
            self.producto.precio_finan_ya,
            Decimal("16254.00")
        )