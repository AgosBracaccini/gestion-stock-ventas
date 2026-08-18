# Requerimientos del sistema

## Objetivo general

Desarrollar una aplicación web para la gestión de ventas y stock de un comercio de indumentaria, centralizando la información actualmente distribuida en diferentes hojas de cálculo y automatizando procesos relacionados con inventario, precios y ventas.

---

## Alcance de la primera versión

La primera versión del sistema contempla la gestión de:

- Proveedores
- Productos
- Variantes de productos
- Ingreso y reposición de mercadería
- Stock
- Movimientos de stock
- Ventas
- Detalles de venta
- Medios de pago
- Cálculo automático de precios
- Búsqueda y filtrado de productos y variantes
- Autenticación de usuarios

En versiones posteriores podrán incorporarse dashboards, reportes, indicadores comerciales, roles específicos y configuraciones avanzadas.

---

# Requerimientos funcionales

## RF-01 - Gestión de proveedores

El sistema deberá permitir registrar y consultar proveedores.

Cada proveedor podrá estar asociado a múltiples productos.

---

## RF-02 - Gestión de productos

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

Los productos podrán desactivarse sin necesidad de eliminarlos del sistema, permitiendo conservar la información histórica asociada.

---

## RF-03 - Gestión de variantes

El sistema deberá permitir registrar diferentes variantes de un producto según:

- Color
- Talle

Cada variante tendrá asociado su propio stock.

La combinación:

```text
Producto + Color + Talle
```

deberá ser única.

Esto permitirá representar diferentes combinaciones de un mismo producto sin duplicar su información general.

---

## RF-04 - Ingreso y reposición de mercadería

El sistema deberá permitir registrar el ingreso de nueva mercadería.

Si el código ingresado no corresponde a un producto existente, se deberá crear el producto y su correspondiente variante.

Si el producto existe pero la combinación de color y talle es nueva, deberá crearse únicamente la nueva variante.

Si el producto y la variante ya existen, deberá incrementarse la cantidad disponible de dicha variante.

Una reposición de mercadería no deberá modificar automáticamente los datos generales de un producto existente.

Cada ingreso deberá generar el correspondiente movimiento de stock de tipo `ENTRADA`.

---

## RF-05 - Gestión de stock

El sistema deberá mantener la cantidad disponible de cada variante de producto.

El stock deberá actualizarse automáticamente como consecuencia de las operaciones que afecten al inventario.

El sistema deberá permitir consultar variantes según su disponibilidad.

---

## RF-06 - Movimientos de stock

El sistema deberá mantener un historial de las modificaciones realizadas sobre el inventario.

Los tipos de movimiento contemplados inicialmente son:

- ENTRADA
- VENTA
- AJUSTE

Cada movimiento deberá estar asociado a una variante y registrar la información necesaria para identificar la modificación realizada.

Los movimientos generados como consecuencia de operaciones de negocio deberán registrarse automáticamente.

---

## RF-07 - Cálculo de precios

El sistema deberá calcular los precios de venta a partir del costo y los costos extras correspondientes a cada producto.

Las reglas identificadas durante el relevamiento son:

```text
Precio tarjeta = (Costo × 2,5) + Costos extras
Precio débito = Precio tarjeta - 15 %
Precio efectivo / transferencia = Precio tarjeta - 20 %
Precio Fast Cred = Precio efectivo
Precio Finan Ya = Precio efectivo + 5 %
```

El costo y los costos extras podrán variar entre productos.

Estas reglas podrán convertirse posteriormente en parámetros configurables.

---

## RF-08 - Registro de ventas

El sistema deberá permitir registrar una venta compuesta por uno o múltiples artículos.

Para cada artículo vendido se deberá registrar:

- Variante
- Cantidad
- Precio unitario
- Subtotal

La venta deberá registrar:

- Fecha
- Medio de pago
- Total

El precio aplicado deberá conservarse en el detalle de la venta para mantener el valor histórico de la operación.

---

## RF-09 - Actualización automática de stock por venta

Al confirmar una venta, el sistema deberá descontar automáticamente del stock la cantidad vendida de cada variante.

Además, deberá generarse el correspondiente movimiento de stock de tipo `VENTA`.

El sistema no deberá permitir:

- vender una cantidad superior al stock disponible;
- vender cantidades iguales o inferiores a cero;
- vender variantes inexistentes;
- vender productos inactivos;
- incluir una misma variante más de una vez dentro de la misma venta.

---

## RF-10 - Integridad transaccional de ventas

El registro de una venta, sus detalles, la actualización del stock y la generación de movimientos deberán ejecutarse como una única operación transaccional.

Si se produce un error durante cualquiera de estas operaciones, los cambios realizados deberán revertirse.

El sistema no deberá permitir que una venta quede parcialmente registrada.

---

## RF-11 - Búsqueda y filtrado

El sistema deberá permitir buscar y filtrar información de productos y variantes.

Entre los criterios contemplados se encuentran:

- Código
- Descripción o información del producto
- Proveedor
- Estado
- Color
- Talle

El sistema deberá permitir además consultar variantes con bajo stock o sin stock.

---

## RF-12 - Autenticación

El sistema deberá requerir autenticación para acceder a los principales recursos de la API.

La autenticación se realizará mediante JWT.

El sistema deberá permitir:

- autenticar un usuario mediante sus credenciales;
- obtener un access token;
- obtener un refresh token;
- renovar el access token utilizando el refresh token;
- rechazar solicitudes a recursos protegidos cuando no exista una autenticación válida.

---

# Requerimientos no funcionales

## RNF-01 - Persistencia

La información del sistema deberá almacenarse en una base de datos PostgreSQL.

---

## RNF-02 - API REST

El backend deberá exponer sus funcionalidades mediante una API REST desarrollada con Django REST Framework.

Esto permitirá desacoplar el backend del frontend.

---

## RNF-03 - Seguridad

Los endpoints principales deberán encontrarse protegidos mediante autenticación.

Las credenciales y datos sensibles de configuración no deberán almacenarse directamente en el repositorio.

---

## RNF-04 - Integridad de los datos

Las operaciones que involucren múltiples modificaciones relacionadas deberán utilizar mecanismos transaccionales cuando sea necesario para evitar estados inconsistentes.

---

## RNF-05 - Documentación de la API

La API deberá disponer de documentación mediante OpenAPI/Swagger que permita consultar sus endpoints, estructuras de datos y operaciones disponibles.

---

## RNF-06 - Pruebas automatizadas

Las principales reglas de negocio deberán contar con pruebas automatizadas.

Las pruebas deberán contemplar, entre otros aspectos:

- inventario;
- ingreso y reposición de mercadería;
- ventas;
- actualización de stock;
- rollback transaccional;
- validaciones de negocio;
- cálculo de precios;
- autenticación.

---

## RNF-07 - Integración con frontend

El backend deberá permitir solicitudes desde el frontend autorizado mediante una configuración CORS controlada.

Durante el desarrollo local se contemplará la ejecución independiente del frontend y del backend.

---

# Requerimientos futuros

Fuera del alcance de Backend V1 se consideran posibles mejoras:

- dashboard de ventas e inventario;
- indicadores diarios, semanales y mensuales;
- productos más vendidos;
- talles y colores más vendidos;
- análisis de costos y márgenes;
- reportes;
- exportación de información;
- stock mínimo configurable;
- configuración dinámica de reglas de precios;
- roles y permisos específicos;
- despliegue de la aplicación.