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
| PF-25 | Importar el stock: intentar ejecutar la importación | El sistema advierte que el stock actual se reemplaza y pide confirmación antes de ejecutar | Pendiente |
| PF-26 | Importar el historial de ventas desde Excel | Se crean las ventas con su fecha y precio originales, sin modificar el stock ni generar movimientos | Pendiente |
| PF-27 | Importar dos veces el mismo archivo de ventas | La segunda vez las ventas se omiten por duplicadas y no se crean registros repetidos | Pendiente |
| PF-28 | Importar una venta por transferencia sin nombre, apellido o teléfono | La fila se informa con su motivo y las demás se importan | Pendiente |
| PF-29 | Subir un archivo que no sea .xlsx o que supere los 5 MB | El sistema rechaza el archivo con un mensaje claro | Pendiente |

## Datos y validaciones

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-30 | Ingresar mercadería con el color "NEGRO" y luego con "negro" para el mismo producto y talle | Se usa una única variante, con el color "Negro" y el stock sumado | Pendiente |
| PF-31 | Ingresar un talle en minúscula (por ejemplo "m") | Se guarda como "M" | Pendiente |
| PF-32 | Crear un proveedor con un nombre que ya existe, cambiando mayúsculas o espacios | El sistema rechaza el duplicado con un mensaje claro | Pendiente |
| PF-33 | Abrir Movimientos de stock | Cada movimiento muestra la prenda, el código, el color y el talle (no "Variante n") | Pendiente |
| PF-34 | Cambiar el multiplicador en Configuración de precios | Se muestra la simulación del efecto y se pide confirmación antes de guardar | Pendiente |
| PF-35 | Cambiar precios y abrir una venta anterior | La venta anterior conserva el precio al que se realizó | Pendiente |

## Seguridad

| N° | Caso de prueba | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| PF-36 | Ingresar 6 veces seguidas una contraseña incorrecta en menos de un minuto | A partir del sexto intento el sistema bloquea temporalmente el acceso | Pendiente |
| PF-37 | Abrir una pantalla protegida sin haber iniciado sesión | Redirige al login | Pendiente |
| PF-38 | Abrir el QR de una caja desde el celular, sin sesión iniciada | Muestra el contenido de la caja en modo solo lectura | Pendiente |
| PF-39 | Abrir una URL de caja con un código inventado | El sistema informa que la caja no existe, sin revelar datos | Pendiente |
| PF-40 | Imprimir el QR de una caja desde una dirección localhost | El sistema advierte que el QR no funcionará desde un celular y pide confirmar | Pendiente |

## Pruebas automatizadas

Además de las pruebas manuales, el backend cuenta con pruebas automatizadas que cubren las reglas de inventario, ventas, cálculo de precios, normalización de colores y talles, proveedores, movimientos de stock, importación desde Excel y autenticación. Se ejecutan con:

```text
python manage.py test
```

| Fecha | Resultado | Observaciones |
| --- | --- | --- |
| 23/10/2026 | OK | 20 pruebas ejecutadas en 5,3 segundos, sin errores. |
| 09/11/2026 | OK | 68 pruebas ejecutadas en 41,5 segundos, sin errores. |

## Observaciones

Los resultados de las pruebas, las fallas encontradas y su corrección se registran en esta sección.

Fallas detectadas durante la revisión del sistema (octubre y noviembre de 2026) y su corrección:

- Una misma variante podía duplicarse según se escribiera el color o el talle ("negro" y "Negro"). Se incorporó la normalización de colores y talles y una migración de datos que unificó los duplicados existentes.
- Los movimientos de stock mostraban "Variante n" en lugar de la prenda. Se completó el serializador con descripción, código, color y talle.
- Era posible crear proveedores con el mismo nombre, lo que podía hacer fallar las importaciones. Se agregó una validación que ignora mayúsculas y espacios.
- La importación de stock reemplazaba cantidades sin advertirlo. Se agregó una advertencia con confirmación explícita.
- El cambio de precios se guardaba sin mostrar su efecto. Se agregó una simulación con confirmación.
- La hoja de impresión del QR de las cajas se veía descentrada y poco legible. Se rediseñó.
- El QR podía generarse desde localhost, y entonces no abría desde un celular. Se agregó una advertencia al imprimir.
- La vista previa de la etiqueta cambiaba de color de forma permanente sin haber guardado. Se restauró el color guardado al salir de la pantalla.

Los resultados de los casos manuales (PF-01 a PF-40) se registran en la columna "Resultado" de cada tabla.