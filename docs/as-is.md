# Análisis de la situación actual (AS-IS)

## Contexto

El proyecto surge a partir del análisis del proceso de gestión utilizado actualmente en un comercio de indumentaria.

La gestión de productos, precios, ventas y stock se realiza principalmente mediante diferentes hojas de cálculo de Excel.

Si bien estas herramientas permiten registrar la información necesaria para la operación diaria del comercio, existen procesos manuales y datos distribuidos entre diferentes archivos que dificultan el mantenimiento actualizado del inventario y el análisis de la información.

> Los datos utilizados en este repositorio son ficticios. No se incluye información comercial real del negocio analizado.

---

## Gestión actual de productos y precios

La información relacionada con los productos y sus precios se almacena mediante los siguientes datos:

- Código
- Descripción
- Costo
- Costos extras
- Precio tarjeta
- Precio débito
- Precio efectivo / transferencia
- Proveedor
- Stock inicial
- Stock vendido
- Stock actual

Los precios de venta se calculan actualmente mediante fórmulas definidas en las hojas de cálculo.

Las reglas identificadas durante el relevamiento son:

- Precio tarjeta = (Costo × 2,5) + Costos extras
- Precio débito = Precio tarjeta - 15 %
- Precio efectivo / transferencia = Precio tarjeta - 20 %
- Precio Finan Ya = Precio efectivo + 5 %

Posteriormente, estos precios son consultados desde otra hoja mediante el código del producto.

---

## Gestión actual del stock

El inventario almacena:

- Código
- Tipo de prenda
- Modelo
- Color
- Talle
- Cantidad

Un mismo código puede aparecer varias veces debido a que un producto puede encontrarse disponible en diferentes colores y talles.

Actualmente, el stock no se actualiza automáticamente cuando se registra una venta.

Por este motivo, periódicamente se realizan controles manuales de las existencias y se modifica la información de stock.

---

## Proceso actual de venta

Para realizar una venta:

1. Se ingresa el código del producto.
2. La hoja de cálculo consulta los precios asociados al código.
3. Se muestran los valores correspondientes a los diferentes medios de pago.
4. Se determina el medio de pago utilizado por el cliente.
5. Se registra la venta en otra hoja.
6. Los valores correspondientes a los medios de pago no utilizados deben eliminarse manualmente del registro.
7. La venta realizada no actualiza automáticamente el stock.

Cuando una compra contiene más de un producto, cada artículo vendido queda registrado en una fila independiente.

---

## Medios de pago

Actualmente se utilizan:

- Efectivo
- Transferencia
- Tarjeta de débito
- Tarjeta de crédito
- Fast Cred
- Finan Ya

Para Fast Cred y Finan Ya se utilizan además sus respectivas plataformas externas.

El alcance inicial del proyecto no contempla integraciones directas con dichas plataformas.

---

## Problemas identificados

A partir del relevamiento se identificaron los siguientes puntos de mejora:

- Información distribuida entre diferentes archivos y hojas de cálculo.
- Actualización manual del stock.
- Posibilidad de inconsistencias entre ventas registradas y stock disponible.
- Procesos manuales durante el registro de ventas.
- Dificultad para mantener trazabilidad de los movimientos de inventario.
- Dificultad para obtener indicadores sobre ventas, productos y disponibilidad de stock.
- Duplicación de información entre diferentes hojas de cálculo.

---

## Oportunidad de mejora

Se propone desarrollar una aplicación web que centralice la gestión de productos, variantes, precios, ventas e inventario.

La solución permitirá que, al confirmar una venta, el sistema registre la operación y actualice automáticamente el stock correspondiente.

Además, los movimientos de inventario quedarán registrados para permitir conocer las causas de las variaciones de stock.