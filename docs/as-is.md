# Análisis de la situación actual (AS-IS)

## Contexto

El proyecto surge a partir del análisis del proceso de gestión utilizado actualmente en un comercio de indumentaria.

La gestión de productos, precios, ventas y stock se realiza principalmente mediante diferentes archivos y hojas de cálculo de Excel.

Si bien estas herramientas permiten registrar la información necesaria para la operación diaria del comercio, existen procesos manuales, información duplicada y datos distribuidos entre diferentes archivos que dificultan el mantenimiento actualizado del inventario y el análisis consolidado de la información.

> Los datos utilizados en este repositorio son ficticios. No se incluye información comercial real del negocio analizado.

---

## Archivos utilizados actualmente

Durante el relevamiento se identificaron diferentes archivos de Excel destinados a tareas específicas.

### Archivo de consulta de precios y registro de ventas

Contiene hojas destinadas a:

- consultar precios mediante el código del producto;
- obtener los valores correspondientes a los diferentes medios de pago;
- registrar los artículos vendidos;
- mantener una tabla de códigos, descripciones y precios.

La consulta de precios se realiza mediante fórmulas de búsqueda que utilizan el código del producto como referencia.

### Archivo de stock

Contiene información sobre:

- código;
- tipo de prenda;
- modelo;
- color;
- talle;
- cantidad.

También dispone de una hoja destinada a facilitar la búsqueda de artículos dentro del inventario.

### Archivo de modificación de precios

Contiene información utilizada para calcular y mantener los precios de los productos:

- código;
- descripción;
- costo;
- costos extras;
- precio tarjeta;
- precio débito;
- precio efectivo / transferencia;
- proveedor;
- stock inicial;
- stock vendido;
- stock actual.

Esta separación provoca que información relacionada con un mismo producto se encuentre distribuida entre diferentes archivos y hojas de cálculo.

---

## Gestión actual de productos y precios

Los precios de venta se calculan mediante fórmulas definidas en las hojas de cálculo.

Las reglas identificadas durante el relevamiento son:

```text
Precio tarjeta = (Costo × 2,5) + Costos extras
Precio débito = Precio tarjeta - 15 %
Precio efectivo / transferencia = Precio tarjeta - 20 %
Precio Fast Cred = Precio efectivo
Precio Finan Ya = Precio efectivo + 5 %
```

El costo y los costos extras pueden variar según el producto.

Posteriormente, estos precios son consultados desde otra hoja utilizando el código del producto.

La consulta se realiza actualmente mediante fórmulas `BUSCARV`, relacionando el código ingresado con la tabla de precios correspondiente.

---

## Gestión actual del stock

El inventario almacena:

- Código
- Tipo de prenda
- Modelo
- Color
- Talle
- Cantidad

Un mismo código puede aparecer en varias filas debido a que un producto puede encontrarse disponible en diferentes combinaciones de color y talle.

Por ejemplo:

```text
Código  | Prenda | Modelo | Color | Talle | Cantidad
-----------------------------------------------------
8028    | Calza  | Lycra  | Negro | 1     | 2
8028    | Calza  | Lycra  | Negro | 2     | 1
8028    | Calza  | Lycra  | Azul  | 1     | 1
```

Cada fila representa una combinación particular del producto.

Actualmente, el stock no se actualiza automáticamente cuando se registra una venta.

Por este motivo, se realizan controles manuales de las existencias y posteriormente se modifica la información registrada en las hojas de cálculo.

Esto puede generar diferencias entre las ventas realizadas y las cantidades registradas en el inventario.

---

## Proceso actual de venta

El proceso identificado durante el relevamiento es:

1. Se ingresa el código del producto.
2. La hoja de cálculo busca automáticamente los precios asociados al código.
3. Se muestran los valores correspondientes a los diferentes medios de pago.
4. Se determina el medio de pago utilizado por el cliente.
5. Se registra el artículo vendido en otra hoja.
6. Los valores correspondientes a los medios de pago no utilizados deben eliminarse manualmente del registro.
7. Si existen varios productos en una misma compra, cada artículo se registra en una fila independiente.
8. La venta registrada no descuenta automáticamente las unidades correspondientes del stock.

Por lo tanto, el registro de la venta y la actualización del inventario funcionan actualmente como procesos separados.

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

El alcance inicial del proyecto no contempla integraciones directas con dichas plataformas. El sistema solamente considera las reglas de precio correspondientes a estos medios de pago.

---

## Problemas identificados

A partir del relevamiento se identificaron los siguientes puntos de mejora:

- Información distribuida entre diferentes archivos y hojas de cálculo.
- Duplicación de información relacionada con productos y precios.
- Actualización manual del stock.
- Separación entre el registro de una venta y la actualización del inventario.
- Posibilidad de inconsistencias entre ventas registradas y stock disponible.
- Procesos manuales durante el registro de ventas.
- Posibilidad de errores durante la modificación manual de información.
- Falta de trazabilidad centralizada de los movimientos de inventario.
- Dificultad para obtener información consolidada sobre ventas y disponibilidad de stock.
- Dificultad para obtener indicadores a partir de la información registrada.

---

## Oportunidad de mejora

A partir de los problemas identificados surge la oportunidad de centralizar la información y automatizar tareas que actualmente se realizan de forma manual.

Se propone desarrollar una aplicación web que centralice la gestión de productos, variantes, precios, ventas e inventario.

La solución permitirá relacionar el registro de las ventas con la actualización del stock, evitando que ambos procesos deban realizarse de manera independiente.

Además, los movimientos del inventario podrán quedar registrados para conservar trazabilidad sobre las variaciones de stock.