# Pruebas funcionales

## Objetivo

Verificar que las funcionalidades del sistema se comportan según los requerimientos definidos, tanto en el uso normal como ante datos incorrectos.

Las pruebas se realizan de forma manual sobre el sistema en ejecución, ingresando datos reales o de ejemplo, y registrando el resultado obtenido en cada caso.

## Entorno de prueba

| Dato | Valor |
| --- | --- |
| Servidor | Computadora del local (backend, frontend y base de datos) |
| Dispositivos | Computadora con navegador y celular conectado a la misma red WiFi |
| Backend | Django REST Framework, puerto 8000 |
| Frontend | React + Vite, puerto 5173 |
| Base de datos | PostgreSQL |

## Cómo leer las tablas

La columna **Resultado** indica el estado de cada caso:

- **OK**: el sistema se comportó como se esperaba.
- **Falla**: no se comportó como se esperaba (se describe qué pasó).
- **Pendiente**: todavía no se probó.

## Autenticación y ventas

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-01 | Iniciar sesión con usuario y contraseña correctos | Ingresa al sistema y muestra el panel principal | Pendiente |
| PF-02 | Iniciar sesión con contraseña incorrecta | Muestra un mensaje de error y no permite ingresar | Pendiente |
| PF-03 | Registrar una venta en efectivo de un producto con stock | La venta se guarda y el stock de la variante disminuye en la cantidad vendida | Pendiente |
| PF-04 | Intentar vender más unidades que el stock disponible | El sistema rechaza la venta e informa que el stock es insuficiente; el stock no cambia | Pendiente |
| PF-05 | Registrar una venta por transferencia y luego marcarla como verificada | Queda pendiente de verificación y luego pasa a verificada, sin alterar importes ni stock | Pendiente |

## Ingreso de mercadería y precios

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-06 | Ingresar mercadería con un código que no existe | Se crean el producto y la variante, y el stock queda cargado | Pendiente |
| PF-07 | Ingresar mercadería de una variante ya existente | Se suma la cantidad al stock actual y se registra un movimiento ENTRADA | Pendiente |
| PF-08 | Cambiar el multiplicador en la configuración de precios | Los precios de los productos se recalculan con el nuevo valor; las ventas anteriores conservan su precio | Pendiente |

## Personalización y etiquetas

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-09 | Cambiar nombre, color e intensidad de la tienda | La interfaz cambia de color y muestra el nuevo nombre | Pendiente |
| PF-10 | Modificar y guardar el diseño de la etiqueta | La vista previa se actualiza y el diseño se conserva al volver a ingresar | Pendiente |
| PF-11 | Agregar productos a la lista de etiquetas e imprimir (guardando como PDF) | Se genera una hoja con una etiqueta por unidad indicada, con nombre de la tienda, código y talle | Pendiente |

## Cajas de depósito

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-12 | Crear una caja con dos productos | Se guarda la caja, se le asigna un número y se muestra su QR | Pendiente |
| PF-13 | Editar una caja: cambiar una cantidad, quitar un producto y agregar otro | El contenido se actualiza y el código QR no cambia | Pendiente |
| PF-14 | Intentar guardar una caja sin productos | El botón de guardar está deshabilitado | Pendiente |
| PF-15 | Eliminar una caja | La caja desaparece del listado, previa confirmación | Pendiente |

## QR y comunicación entre dispositivos

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-16 | Escanear el QR de una caja con el celular conectado a la misma WiFi | Se abre la pantalla pública con los artículos, talles y cantidades de la caja | Pendiente |
| PF-17 | Abrir esa pantalla sin haber iniciado sesión | Se muestra el contenido sin pedir usuario ni contraseña | Pendiente |
| PF-18 | Abrir una dirección de caja con un código que no existe | Muestra un mensaje de error indicando que no se encontró la caja | Pendiente |
| PF-19 | Escanear el QR con un celular conectado a otra red (datos móviles) | No se puede acceder (limitación conocida de la red local) | Pendiente |
| PF-20 | Editar el contenido de una caja y volver a escanear su QR | El celular muestra el contenido actualizado | Pendiente |

## Importación desde Excel

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-21 | Importar el archivo de precios y proveedores | Se crean o actualizan los productos y proveedores; se informa la cantidad de filas procesadas | Pendiente |
| PF-22 | Importar el archivo de stock después del de precios | Se crean las variantes y el stock queda cargado | Pendiente |
| PF-23 | Importar un archivo con una fila con datos faltantes | La fila se informa con su motivo, las demás se importan, y la fila con error puede corregirse a mano | Pendiente |
| PF-24 | Importar stock con un código que no existe, completando prenda, costo y proveedor | Se crea el producto nuevo junto con su variante | Pendiente |

## Pruebas automatizadas

Además de las pruebas manuales, el backend cuenta con pruebas automatizadas que cubren las reglas de inventario y ventas. Se ejecutan con:

```text
python manage.py test
```

| Fecha | Resultado | Observaciones |
| --- | --- | --- |
| 23/10/2026 | OK | 20 pruebas ejecutadas en 5,3 segundos, sin errores. |

## Observaciones

Los resultados de las pruebas, las fallas encontradas y su corrección se registran en esta sección.

- Pendiente