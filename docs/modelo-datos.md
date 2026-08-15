# Modelo de datos

## Descripción

El modelo de datos fue diseñado a partir del relevamiento del proceso actual de gestión de ventas e inventario.

Se identificaron seis entidades principales:

- Proveedor
- Producto
- VarianteProducto
- MovimientoStock
- Venta
- DetalleVenta

---

## Diagrama Entidad-Relación

![Diagrama Entidad-Relación](images/diagrama-er.png)

---

## Proveedor

Representa a los proveedores de mercadería.

Un proveedor puede estar asociado a múltiples productos.

Relación:

Proveedor 1:N Producto

---

## Producto

Representa el producto general identificado mediante un código.

Contiene información como:

- Código
- Prenda
- Modelo
- Descripción
- Costo
- Costo extra
- Estado
- Proveedor

El código se almacena como texto debido a que representa un identificador y no un valor destinado a operaciones matemáticas.

Cada código debe ser único.

---

## VarianteProducto

Representa una combinación específica de color y talle correspondiente a un producto.

Ejemplo:

Producto:
8019 - Jean Mom

Variantes:
- Azul / 38
- Azul / 40
- Negro / 38
- Negro / 40

Cada variante mantiene su propio stock.

Relación:

Producto 1:N VarianteProducto

La combinación:

Producto + Color + Talle

debe ser única.

Esta decisión evita duplicar variantes y permite incrementar el stock de una variante existente cuando ingresa nueva mercadería.

---

## MovimientoStock

Representa cada modificación realizada sobre el inventario.

Los movimientos considerados inicialmente son:

- ENTRADA
- VENTA
- AJUSTE

Cada movimiento se encuentra asociado a una variante específica.

Relación:

VarianteProducto 1:N MovimientoStock

La existencia de esta entidad permite mantener trazabilidad sobre las modificaciones del inventario.

Mientras `stock_actual` permite conocer cuánto stock existe en un momento determinado, `MovimientoStock` permite conocer por qué se llegó a dicha cantidad.

---

## Venta

Representa una operación de venta completa.

Contiene:

- Fecha
- Medio de pago
- Total

Una venta puede contener uno o múltiples artículos.

Por este motivo, los productos vendidos no se almacenan directamente en la entidad Venta.

---

## DetalleVenta

Representa cada artículo incluido dentro de una venta.

Contiene:

- Venta
- Variante del producto
- Cantidad
- Precio unitario
- Subtotal

Relaciones:

Venta 1:N DetalleVenta

VarianteProducto 1:N DetalleVenta

La relación se realiza con VarianteProducto y no directamente con Producto debido a que el sistema necesita identificar exactamente qué combinación de talle y color fue vendida para actualizar correctamente el stock.

---

## Decisiones de diseño

### Separación entre Producto y VarianteProducto

Durante el relevamiento se detectó que un mismo código puede aparecer múltiples veces debido a las diferentes combinaciones de talle y color.

Por este motivo se separó el concepto general de Producto de sus variantes.

---

### Separación entre Venta y DetalleVenta

Una misma operación puede incluir múltiples prendas.

Venta representa la operación general, mientras que DetalleVenta representa cada artículo incluido en ella.

---

### Historial de movimientos de stock

Además de mantener el stock actual, se creó MovimientoStock para conservar trazabilidad sobre entradas, ventas y ajustes.

---

### Uso de valores decimales para importes

Los valores monetarios se representan mediante campos decimales para evitar los problemas de precisión asociados a números de punto flotante.

---

### Eliminación y conservación del historial

Se utilizan estrategias de protección en relaciones que contienen información histórica.

Por ejemplo, una variante asociada a movimientos de stock o ventas no debería eliminarse si esto implica perder la trazabilidad de operaciones anteriores.

Los productos incluyen además un estado activo/inactivo para permitir retirar productos de la operatoria sin necesidad de eliminar su información histórica.