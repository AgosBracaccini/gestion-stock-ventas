"""
Pruebas automatizadas de los módulos incorporados en la segunda etapa:
cajas con QR, importación desde Excel y configuraciones de tienda y etiqueta.
"""

from io import BytesIO

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from openpyxl import Workbook
from rest_framework import status
from rest_framework.test import APITestCase

from inventario.models import (
    Caja,
    MovimientoStock,
    Producto,
    Proveedor,
    VarianteProducto,
)


def crear_producto_con_variante(codigo="X1", color="Negro", talle="M", stock=3):
    proveedor, _ = Proveedor.objects.get_or_create(nombre="Proveedor Test")
    producto, _ = Producto.objects.get_or_create(
        codigo=codigo,
        defaults={
            "prenda": "Remera",
            "modelo": "lisa",
            "descripcion": "Remera lisa",
            "costo": 1000,
            "proveedor": proveedor,
        },
    )
    variante = VarianteProducto.objects.create(
        producto=producto, color=color, talle=talle, stock_actual=stock
    )
    return variante


class BaseAutenticadaTest(APITestCase):
    """Crea un usuario y lo deja con sesión iniciada."""

    def setUp(self):
        self.usuario = User.objects.create_user(
            username="tester", password="clave_test_123"
        )
        self.client.force_authenticate(user=self.usuario)


class CajasTest(BaseAutenticadaTest):

    def setUp(self):
        super().setUp()
        self.variante_a = crear_producto_con_variante("A1", "Negro", "M", 3)
        self.variante_b = crear_producto_con_variante("B1", "Azul", "L", 5)

    def test_crear_caja_con_contenido(self):
        respuesta = self.client.post(
            "/api/cajas/",
            {
                "nombre": "Caja 1",
                "items": [{"variante_id": self.variante_a.id, "cantidad": 2}],
            },
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertTrue(respuesta.data["codigo_publico"])
        self.assertEqual(len(respuesta.data["items"]), 1)

    def test_registrar_caja_no_modifica_el_stock(self):
        self.client.post(
            "/api/cajas/",
            {
                "nombre": "Caja 1",
                "items": [{"variante_id": self.variante_a.id, "cantidad": 2}],
            },
            format="json",
        )
        self.variante_a.refresh_from_db()
        self.assertEqual(self.variante_a.stock_actual, 3)
        self.assertEqual(MovimientoStock.objects.count(), 0)

    def test_caja_sin_articulos_se_rechaza(self):
        respuesta = self.client.post(
            "/api/cajas/", {"nombre": "Vacía", "items": []}, format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cantidad_cero_se_rechaza(self):
        respuesta = self.client.post(
            "/api/cajas/",
            {
                "nombre": "Caja",
                "items": [{"variante_id": self.variante_a.id, "cantidad": 0}],
            },
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_reemplaza_contenido_y_conserva_el_codigo_qr(self):
        creada = self.client.post(
            "/api/cajas/",
            {
                "nombre": "Caja 1",
                "items": [{"variante_id": self.variante_a.id, "cantidad": 2}],
            },
            format="json",
        )
        codigo_original = creada.data["codigo_publico"]

        respuesta = self.client.put(
            f"/api/cajas/{creada.data['id']}/",
            {
                "nombre": "Caja 1 editada",
                "items": [{"variante_id": self.variante_b.id, "cantidad": 4}],
            },
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["codigo_publico"], codigo_original)
        self.assertEqual(len(respuesta.data["items"]), 1)
        self.assertEqual(respuesta.data["items"][0]["cantidad"], 4)
        self.assertEqual(
            respuesta.data["items"][0]["variante"]["producto_codigo"], "B1"
        )

    def test_editar_dejando_la_caja_vacia_se_rechaza(self):
        creada = self.client.post(
            "/api/cajas/",
            {
                "nombre": "Caja 1",
                "items": [{"variante_id": self.variante_a.id, "cantidad": 2}],
            },
            format="json",
        )
        respuesta = self.client.put(
            f"/api/cajas/{creada.data['id']}/",
            {"nombre": "Caja 1", "items": []},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_borrar_caja(self):
        creada = self.client.post(
            "/api/cajas/",
            {
                "nombre": "Caja 1",
                "items": [{"variante_id": self.variante_a.id, "cantidad": 2}],
            },
            format="json",
        )
        respuesta = self.client.delete(f"/api/cajas/{creada.data['id']}/")
        self.assertEqual(respuesta.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Caja.objects.count(), 0)


def armar_xlsx(filas, nombre_hoja="Hoja1"):
    libro = Workbook()
    hoja = libro.active
    hoja.title = nombre_hoja
    for fila in filas:
        hoja.append(fila)
    buffer = BytesIO()
    libro.save(buffer)
    return buffer.getvalue()


class ImportacionExcelTest(BaseAutenticadaTest):

    def _subir(self, url, contenido, nombre="datos.xlsx"):
        archivo = SimpleUploadedFile(nombre, contenido)
        return self.client.post(url, {"archivo": archivo}, format="multipart")

    def test_importar_stock_fija_la_cantidad_y_no_crea_movimientos(self):
        crear_producto_con_variante("S1", "Rojo", "S", 1)
        VarianteProducto.objects.all().delete()  # solo queda el producto

        contenido = armar_xlsx(
            [
                ["CODIGO", "COLOR", "TALLE", "CANTIDAD"],
                ["S1", "Negro", "M", 4],
                ["S1", "Negro", "L", 6],
            ],
            nombre_hoja="STOCK",
        )
        respuesta = self._subir("/api/importar/stock/", contenido)

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["creados"], 2)
        self.assertEqual(respuesta.data["errores"], [])
        self.assertEqual(
            VarianteProducto.objects.get(color="Negro", talle="M").stock_actual, 4
        )
        self.assertEqual(MovimientoStock.objects.count(), 0)

    def test_reimportar_reemplaza_el_stock_y_no_lo_suma(self):
        crear_producto_con_variante("S1", "Negro", "M", 10)

        contenido = armar_xlsx(
            [["CODIGO", "COLOR", "TALLE", "CANTIDAD"], ["S1", "Negro", "M", 4]],
            nombre_hoja="STOCK",
        )
        respuesta = self._subir("/api/importar/stock/", contenido)

        self.assertEqual(respuesta.data["creados"], 0)
        self.assertEqual(respuesta.data["actualizados"], 1)
        self.assertEqual(VarianteProducto.objects.get().stock_actual, 4)

    def test_codigo_inexistente_se_informa_como_error(self):
        contenido = armar_xlsx(
            [["CODIGO", "COLOR", "TALLE", "CANTIDAD"], ["NOEXISTE", "Negro", "M", 2]],
            nombre_hoja="STOCK",
        )
        respuesta = self._subir("/api/importar/stock/", contenido)

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["creados"], 0)
        self.assertEqual(len(respuesta.data["errores"]), 1)
        self.assertIn("No existe", respuesta.data["errores"][0]["mensaje"])

    def test_importar_precios_actualiza_crea_y_reporta_errores(self):
        crear_producto_con_variante("T001", "Negro", "M", 1)

        contenido = armar_xlsx(
            [
                ["CODIGO", "DESCRIPCION", "COSTO", "PROVEEDOR"],
                ["T001", "Remera lisa", 2000, "Proveedor Test"],
                ["T002", "Short liso", 3000, "Proveedor Test"],
                ["T003", "Buzo liso", 4000, ""],
            ]
        )
        respuesta = self._subir("/api/importar/precios/", contenido)

        self.assertEqual(respuesta.data["actualizados"], 1)
        self.assertEqual(respuesta.data["creados"], 1)
        self.assertEqual(len(respuesta.data["errores"]), 1)
        self.assertEqual(Producto.objects.get(codigo="T001").costo, 2000)
        self.assertTrue(Producto.objects.filter(codigo="T002").exists())
        self.assertFalse(Producto.objects.filter(codigo="T003").exists())

    def test_corregir_fila_de_stock_con_datos_validos(self):
        crear_producto_con_variante("S1", "Rojo", "S", 1)

        respuesta = self.client.post(
            "/api/importar/stock/fila/",
            {"codigo": "S1", "color": "Verde", "talle": "XL", "cantidad": 7},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertTrue(respuesta.data["creado"])

    def test_corregir_fila_de_stock_sin_color_se_rechaza(self):
        respuesta = self.client.post(
            "/api/importar/stock/fila/",
            {"codigo": "S1", "color": "", "talle": "XL", "cantidad": 7},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)


class ConfiguracionEtiquetaTest(BaseAutenticadaTest):

    def test_exige_login(self):
        self.client.force_authenticate(user=None)
        respuesta = self.client.get("/api/configuracion-etiqueta/")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_color_invalido_se_rechaza(self):
        respuesta = self.client.patch(
            "/api/configuracion-etiqueta/1/",
            {"color_fondo": "rojo"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_color_valido_se_guarda_en_minusculas(self):
        respuesta = self.client.patch(
            "/api/configuracion-etiqueta/1/",
            {"color_fondo": "#FF0000"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["color_fondo"], "#ff0000")

    def test_tamano_de_letra_fuera_de_rango_se_rechaza(self):
        respuesta = self.client.patch(
            "/api/configuracion-etiqueta/1/",
            {"tamano_texto_tienda": 100},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)


class ConfiguracionTiendaTest(BaseAutenticadaTest):

    def test_editar_exige_login(self):
        self.client.force_authenticate(user=None)
        respuesta = self.client.patch(
            "/api/configuracion-tienda/1/", {"nombre": "Otra"}, format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nombre_vacio_se_rechaza(self):
        respuesta = self.client.patch(
            "/api/configuracion-tienda/1/", {"nombre": "   "}, format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_guarda_nombre_color_e_intensidad(self):
        respuesta = self.client.patch(
            "/api/configuracion-tienda/1/",
            {"nombre": "Mi Tienda Test", "color": "verde", "intensidad": "fuerte"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["intensidad"], "fuerte")

        publica = self.client.get("/api/configuracion-tienda/")
        self.assertEqual(publica.data["nombre"], "Mi Tienda Test")
        self.assertEqual(publica.data["color"], "verde")
        self.assertEqual(publica.data["intensidad"], "fuerte")