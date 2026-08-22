# Modelo de datos

## Descripción

El modelo de datos fue diseñado a partir del relevamiento del proceso actual de gestión de ventas e inventario.

El objetivo es representar de forma estructurada los productos, sus diferentes variantes, las existencias disponibles, los movimientos de inventario y las operaciones de venta.

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

```text
Proveedor 1:N Producto
```

La información del proveedor se mantiene separada de `Producto` para evitar repetir sus datos en cada artículo asociado.

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

El campo de estado permite mantener productos activos o inactivos sin necesidad de eliminar información histórica.

Los valores de costo y costo extra pertenecen a cada producto y pueden variar entre productos.

A partir de estos valores se calculan los precios correspondientes a los diferentes medios de pago según las reglas de negocio definidas.

Relaciones:

```text
Proveedor 1:N Producto

Producto 1:N VarianteProducto
```

---

## VarianteProducto

Representa una combinación específica de color y talle correspondiente a un producto.

Ejemplo:

```text
Producto:
8019 - Jean Mom

Variantes:
- Azul / 38
- Azul / 40
- Negro / 38
- Negro / 40
```

Cada variante mantiene su propio `stock_actual`.

Esto permite conocer la disponibilidad de una combinación concreta de producto, color y talle sin tener que calcular permanentemente el stock a partir de todo el historial de movimientos.

Relación:

```text
Producto 1:N VarianteProducto
```

La combinación:

```text
Producto + Color + Talle
```

debe ser única.

Esta restricción evita duplicar variantes y permite incrementar el stock de una variante existente cuando ingresa nueva mercadería.

---

## MovimientoStock

Representa cada modificación realizada sobre el inventario.

Los tipos de movimiento considerados inicialmente son:

- ENTRADA
- VENTA
- AJUSTE

Cada movimiento se encuentra asociado a una variante específica e identifica la cantidad involucrada y el momento en que se produjo la modificación.

Relación:

```text
VarianteProducto 1:N MovimientoStock
```

La existencia de esta entidad permite mantener trazabilidad sobre las modificaciones del inventario.

Mientras `stock_actual` permite conocer cuánto stock existe en un momento determinado, `MovimientoStock` permite conservar información sobre las operaciones que produjeron sus variaciones.

Los movimientos generados por operaciones de negocio, como una venta o un ingreso de mercadería, se crean automáticamente como parte de dichas operaciones.

---

## Venta

Representa una operación de venta completa.

Contiene:

- Fecha
- Medio de pago
- Total

Una venta puede contener uno o múltiples artículos.

Por este motivo, los productos vendidos no se almacenan directamente en la entidad `Venta`, sino mediante sus detalles.

Relación:

```text
Venta 1:N DetalleVenta
```

El total de la venta se obtiene a partir de los subtotales correspondientes a sus detalles.

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

```text
Venta 1:N DetalleVenta

VarianteProducto 1:N DetalleVenta
```

La relación se realiza con `VarianteProducto` y no directamente con `Producto` debido a que el sistema necesita identificar exactamente qué combinación de talle y color fue vendida para actualizar correctamente el stock.

El precio unitario registrado en el detalle corresponde al precio aplicado al momento de realizar la venta.

De esta forma, una modificación futura del costo o de las reglas de precios del producto no altera la información histórica de una venta ya registrada.

---

# Decisiones de diseño

## Separación entre Producto y VarianteProducto

Durante el relevamiento se detectó que un mismo código puede aparecer múltiples veces debido a las diferentes combinaciones de talle y color.

Por este motivo se separó el concepto general de `Producto` de sus variantes.

Esto evita duplicar información general como descripción, modelo, costo y proveedor.

---

## Separación entre Venta y DetalleVenta

Una misma operación puede incluir múltiples prendas.

`Venta` representa la operación general, mientras que `DetalleVenta` representa cada artículo incluido en ella.

Este diseño permite registrar una única venta con múltiples productos o variantes.

---

## Stock actual e historial de movimientos

El sistema mantiene dos conceptos relacionados pero diferentes:

```text
VarianteProducto.stock_actual
        ↓
Disponibilidad actual

MovimientoStock
        ↓
Historial de modificaciones
```

`stock_actual` permite realizar consultas rápidas sobre disponibilidad.

`MovimientoStock` conserva la trazabilidad de entradas, ventas y ajustes.

De esta manera no es necesario reconstruir todo el historial cada vez que se necesita conocer el stock disponible.

---

## Ingreso y reposición de mercadería

El ingreso de mercadería utiliza el código para determinar si el producto ya existe.

### Producto inexistente

Si el código no existe:

```text
Crear Producto
      ↓
Crear Variante
      ↓
Incrementar stock
      ↓
Registrar ENTRADA
```

### Producto existente y variante nueva

Si el producto existe pero la combinación color + talle no existe:

```text
Utilizar Producto existente
      ↓
Crear nueva Variante
      ↓
Incrementar stock
      ↓
Registrar ENTRADA
```

### Producto y variante existentes

Si ambos existen:

```text
Utilizar Producto existente
      ↓
Utilizar Variante existente
      ↓
Sumar cantidad al stock
      ↓
Registrar ENTRADA
```

Durante una reposición, los datos generales del producto existente no se sobrescriben automáticamente.

Una modificación de descripción, modelo, costo, proveedor u otros datos generales debe realizarse explícitamente mediante la gestión del producto.

Esta decisión reduce la posibilidad de modificar accidentalmente información existente durante una reposición de stock.

---

## Venta y actualización de stock

Una venta afecta diferentes entidades del modelo:

```text
Venta
  ↓
DetalleVenta
  ↓
VarianteProducto.stock_actual
  ↓
MovimientoStock (VENTA)
```

La operación se ejecuta de manera transaccional.

Si se produce un error durante cualquiera de estos pasos, los cambios realizados dentro de la operación se revierten para evitar ventas parcialmente registradas o inconsistencias en el inventario.

---

## Uso de valores decimales para importes

Los valores monetarios se representan mediante campos decimales.

Esta decisión evita los problemas de precisión que pueden producirse al utilizar números de punto flotante para operaciones monetarias.

---

## Conservación de valores históricos de venta

El precio unitario y el subtotal se almacenan en `DetalleVenta`.

Esto permite conservar el valor aplicado al momento de la operación independientemente de modificaciones posteriores en:

- costo;
- costo extra;
- reglas de cálculo de precios.

Por lo tanto, las ventas históricas no dependen de recalcular los precios actuales del producto.

---

## Eliminación y conservación del historial

Se utilizan estrategias de protección en relaciones que contienen información histórica.

Una variante asociada a movimientos de stock o ventas no debe eliminarse si esto implica perder la trazabilidad de operaciones anteriores.

Los productos incluyen además un estado activo/inactivo para permitir retirar productos de la operatoria sin necesidad de eliminar su información histórica.

Un producto inactivo conserva sus datos y relaciones históricas, pero no puede utilizarse para registrar nuevas ventas.

---

## Relación con el frontend

El modelo de datos pertenece al backend y constituye la fuente de verdad del sistema.

El frontend desarrollado con React no mantiene una base de datos independiente ni modifica directamente la persistencia.

La información visualizada en la interfaz se obtiene mediante la API REST y las operaciones realizadas desde el frontend se envían al backend para su validación y procesamiento.

La arquitectura mantiene el siguiente flujo:

```text
React
  ↓
API REST
  ↓
Django REST Framework
  ↓
Models
  ↓
PostgreSQL
```

De esta forma:

- PostgreSQL conserva la información persistente;
- Django aplica las reglas de negocio y validaciones;
- React se encarga de la interacción con el usuario y la presentación de los datos.

Esta separación evita mantener estados persistentes duplicados entre frontend y backend y permite conservar una única fuente de verdad para la información del sistema.

---

## Datos derivados para el dashboard

Las métricas mostradas en el dashboard no requieren entidades adicionales dentro del modelo.

Valores como:

- ventas realizadas durante el día;
- total vendido durante el día;
- ventas realizadas durante el mes;
- total vendido durante el mes;
- variantes con stock bajo;
- variantes sin stock;

se obtienen mediante consultas sobre las entidades existentes.

Por ejemplo:

```text
Venta
  ↓
Cantidad y totales por fecha

VarianteProducto
  ↓
Stock bajo / sin stock
```

Esta decisión evita almacenar información redundante que puede calcularse a partir de los datos persistidos.