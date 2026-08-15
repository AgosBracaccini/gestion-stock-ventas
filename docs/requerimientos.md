# Requerimientos del sistema

## Objetivo general

Desarrollar una aplicación web para la gestión de ventas y stock de un comercio de indumentaria, centralizando la información actualmente distribuida en diferentes hojas de cálculo y automatizando la actualización del inventario.

---

## Alcance inicial

La primera versión del sistema permitirá gestionar:

- Proveedores
- Productos
- Variantes de productos
- Stock
- Movimientos de stock
- Ventas
- Detalles de venta
- Medios de pago
- Cálculo de precios

En versiones posteriores se podrán incorporar dashboards, reportes e indicadores comerciales.

---

## Requerimientos funcionales

### RF-01 - Gestión de proveedores

El sistema deberá permitir registrar y consultar proveedores.

Cada proveedor podrá estar asociado a múltiples productos.

---

### RF-02 - Gestión de productos

El sistema deberá permitir registrar productos indicando:

- Código
- Tipo de prenda
- Modelo
- Descripción
- Costo
- Costos extras
- Proveedor
- Estado

Cada código de producto deberá ser único.

Los productos podrán desactivarse sin necesidad de eliminarlos del sistema.

---

### RF-03 - Gestión de variantes

El sistema deberá permitir registrar diferentes variantes de un producto según:

- Color
- Talle

Cada variante tendrá asociado su propio stock.

La combinación producto + color + talle deberá ser única.

Si una variante ya existe y se incorpora nueva mercadería, no deberá crearse nuevamente. Se deberá incrementar el stock de la variante existente.

---

### RF-04 - Gestión de stock

El sistema deberá mantener la cantidad disponible de cada variante de producto.

Los cambios de stock deberán generar movimientos que permitan mantener un historial de las modificaciones realizadas.

---

### RF-05 - Movimientos de stock

El sistema deberá permitir registrar movimientos de:

- Entrada
- Venta
- Ajuste

Cada movimiento deberá indicar:

- Variante
- Tipo de movimiento
- Cantidad
- Fecha
- Observación, cuando corresponda

---

### RF-06 - Cálculo de precios

El sistema deberá calcular los precios de venta a partir del costo del producto y sus costos extras.

Las reglas identificadas inicialmente son:

- Precio tarjeta = (Costo × 2,5) + Costos extras
- Precio débito = Precio tarjeta - 15 %
- Precio efectivo / transferencia = Precio tarjeta - 20 %
- Precio Finan Ya = Precio efectivo + 5 %

Estas reglas podrán convertirse posteriormente en parámetros configurables.

---

### RF-07 - Registro de ventas

El sistema deberá permitir registrar una venta seleccionando uno o más productos y sus respectivas variantes.

Para cada artículo vendido se deberá registrar:

- Variante
- Cantidad
- Precio unitario
- Subtotal

La venta deberá registrar:

- Fecha
- Medio de pago
- Total

---

### RF-08 - Actualización automática de stock

Al confirmar una venta, el sistema deberá descontar automáticamente del stock la cantidad vendida de cada variante.

Además, deberá registrarse el correspondiente movimiento de stock de tipo VENTA.

El sistema no deberá permitir vender una cantidad superior al stock disponible.

---

## Requerimientos futuros

Fuera del alcance inicial se consideran posibles mejoras:

- Dashboard de ventas.
- Ventas diarias, semanales y mensuales.
- Productos más vendidos.
- Talles y colores más vendidos.
- Productos con bajo stock.
- Productos sin stock.
- Análisis de costos y márgenes.
- Reportes.
- Exportación de información.
- Configuración dinámica de reglas de precios.
- Gestión de usuarios y roles.