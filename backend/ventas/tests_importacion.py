from datetime import datetime
from decimal import Decimal

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from inventario.models import MovimientoStock
from inventario.tests_modulos import armar_xlsx, crear_producto_con_variante

from .models import Venta

ENCABEZADOS = [
    "VENTA", "FECHA", "MEDIO DE PAGO", "CODIGO", "COLOR", "TALLE",
    "CANTIDAD", "PRECIO UNITARIO", "NOMBRE", "APELLIDO", "TELEFONO",
]

FECHA_1 = datetime(2025, 10, 3, 10, 30)
FECHA_2 = datetime(2026, 1, 15, 18, 0)

FILAS_VALIDAS = [
    [1, FECHA_1, "EFECTIVO", "A1", "Negro", "M", 2, 5000, None, None, None],
    [1, FECHA_1, "EFECTIVO", "B1", "Azul", "L", 1, 3000, None, None, None],
    [2, FECHA_2, "TRANSFERENCIA", "A1", "Negro", "M", 1, 4000, "Laura", "Gomez", "0000-000001"],
]


class ImportarVentasTest(APITestCase):

    def setUp(self):
        usuario = User.objects.create_user(
            username="vendedor", password="clave_test_123"
        )
        self.client.force_authenticate(user=usuario)
        self.variante_a = crear_producto_con_variante("A1", "Negro", "M", 10)
        self.variante_b = crear_producto_con_variante("B1", "Azul", "L", 5)

    def _importar(self, filas, encabezados=ENCABEZADOS):
        contenido = armar_xlsx([encabezados] + filas, nombre_hoja="VENTAS")
        archivo = SimpleUploadedFile("ventas.xlsx", contenido)
        return self.client.post(
            "/api/importar/ventas/", {"archivo": archivo}, format="multipart"
        )

    def test_importa_ventas_con_sus_detalles_y_su_fecha_original(self):
        respuesta = self._importar(FILAS_VALIDAS)

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["creados"], 2)
        self.assertEqual(respuesta.data["errores"], [])
        self.assertEqual(Venta.objects.count(), 2)

        venta = Venta.objects.get(total=Decimal("13000.00"))
        self.assertEqual(venta.detalles.count(), 2)
        fecha = timezone.localtime(venta.fecha)
        self.assertEqual((fecha.year, fecha.month, fecha.day, fecha.hour), (2025, 10, 3, 10))

    def test_no_modifica_el_stock_ni_crea_movimientos(self):
        self._importar(FILAS_VALIDAS)

        self.variante_a.refresh_from_db()
        self.variante_b.refresh_from_db()
        self.assertEqual(self.variante_a.stock_actual, 10)
        self.assertEqual(self.variante_b.stock_actual, 5)
        self.assertEqual(MovimientoStock.objects.count(), 0)

    def test_guarda_el_cliente_de_la_transferencia_y_la_marca_verificada(self):
        self._importar(FILAS_VALIDAS)

        venta = Venta.objects.get(medio_pago="TRANSFERENCIA")
        self.assertEqual(venta.nombre_transferencia, "Laura")
        self.assertTrue(venta.transferencia_verificada)

    def test_reimportar_omite_las_ventas_ya_cargadas(self):
        self._importar(FILAS_VALIDAS)
        respuesta = self._importar(FILAS_VALIDAS)

        self.assertEqual(respuesta.data["creados"], 0)
        self.assertEqual(respuesta.data["omitidas"], 2)
        self.assertEqual(Venta.objects.count(), 2)

    def test_un_error_no_impide_cargar_las_otras_ventas(self):
        filas = FILAS_VALIDAS[:2] + [
            [3, FECHA_2, "EFECTIVO", "NOEXISTE", "Negro", "M", 1, 5000, None, None, None],
        ]
        respuesta = self._importar(filas)

        self.assertEqual(respuesta.data["creados"], 1)
        self.assertEqual(len(respuesta.data["errores"]), 1)
        self.assertIn("no existe la variante", respuesta.data["errores"][0]["mensaje"])

    def test_medio_de_pago_invalido_se_informa(self):
        respuesta = self._importar(
            [[1, FECHA_1, "BITCOIN", "A1", "Negro", "M", 1, 5000, None, None, None]]
        )
        self.assertEqual(respuesta.data["creados"], 0)
        self.assertEqual(len(respuesta.data["errores"]), 1)

    def test_transferencia_sin_telefono_se_informa(self):
        respuesta = self._importar(
            [[1, FECHA_1, "TRANSFERENCIA", "A1", "Negro", "M", 1, 5000, "Laura", "Gomez", None]]
        )
        self.assertEqual(respuesta.data["creados"], 0)
        self.assertIn("teléfono", respuesta.data["errores"][0]["mensaje"])

    def test_faltan_columnas(self):
        respuesta = self._importar([[1, FECHA_1]], encabezados=["VENTA", "FECHA"])
        self.assertEqual(respuesta.data["creados"], 0)
        self.assertIn("Faltan columnas", respuesta.data["errores"][0]["mensaje"])

    def test_exige_login(self):
        self.client.force_authenticate(user=None)
        respuesta = self.client.post("/api/importar/ventas/")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)