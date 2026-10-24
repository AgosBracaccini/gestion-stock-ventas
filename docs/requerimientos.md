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
- Configuración de parámetros de precios
- Gestión de datos asociados a transferencias
- Verificación de pagos por transferencia
- Acceso a plataformas externas para Fast Cred y Finan Ya
- Búsqueda y filtrado de productos y variantes
- Autenticación de usuarios
- Interfaz web para la operación del sistema
- Dashboard con información de ventas e inventario

## Alcance de la segunda etapa

Sobre la primera versión se incorporaron los siguientes módulos:

- Personalización de la tienda
- Diseño de las etiquetas de precio
- Generación e impresión de etiquetas
- Cajas de depósito con su contenido
- Código QR por caja y consulta pública desde el celular
- Importación de catálogo y stock desde archivos Excel
- Corrección manual de las filas que no pudieron importarse

Quedan para versiones posteriores los reportes avanzados, los indicadores comerciales adicionales, los roles específicos, la exportación de información y las configuraciones avanzadas.

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

Los parámetros generales utilizados para el cálculo de precios deberán poder administrarse mediante una configuración centralizada del sistema, permitiendo modificar las reglas comerciales sin necesidad de alterar el código fuente.

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
Cuando el medio de pago sea `TRANSFERENCIA`, la venta deberá registrar además:

- Nombre del cliente
- Apellido del cliente
- Teléfono
- Estado de verificación de la transferencia

El nombre, apellido y teléfono serán obligatorios para las ventas realizadas mediante transferencia.

Las transferencias se registrarán inicialmente como pendientes de verificación.

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

El sistema deberá requerir autenticación para acceder a los principales recursos de la API y a las pantallas internas de gestión.

La autenticación se realizará mediante JWT.

El sistema deberá permitir:

- autenticar un usuario mediante sus credenciales;
- obtener un access token;
- obtener un refresh token;
- renovar el access token utilizando el refresh token;
- cerrar la sesión;
- mantener la sesión mientras las credenciales sean válidas;
- rechazar solicitudes a recursos protegidos cuando no exista una autenticación válida.

---

## RF-13 - Dashboard

El sistema deberá disponer de un dashboard que permita visualizar un resumen de la actividad comercial y del estado del inventario.

El dashboard deberá mostrar al menos:

- cantidad de ventas realizadas durante el día;
- importe total vendido durante el día;
- cantidad de ventas realizadas durante el mes;
- importe total vendido durante el mes;
- cantidad de variantes con stock bajo;
- cantidad de variantes sin stock.

La información deberá obtenerse a partir de los datos reales registrados en el sistema.

El frontend no deberá utilizar valores simulados para representar estas métricas durante la operación normal del sistema.

---

## RF-14 - Interfaz web

El sistema deberá disponer de una interfaz web que permita operar las principales funcionalidades mediante un navegador.

La interfaz deberá permitir acceder a:

- inicio de sesión;
- dashboard;
- productos y stock;
- ingreso y reposición de mercadería;
- registro de nuevas ventas;
- historial de ventas;
- movimientos de stock;
- proveedores;
- configuración de precios.

Las operaciones realizadas desde el frontend deberán comunicarse con el backend mediante la API REST.

La interfaz deberá reflejar los resultados de las operaciones realizadas sobre la información persistida en el backend.

---

## RF-15 - Protección de rutas

Las pantallas internas de gestión deberán requerir una sesión autenticada.

Un usuario sin una sesión válida no deberá poder acceder a las funcionalidades protegidas del sistema.

Cuando la sesión deje de ser válida, el sistema deberá impedir el acceso a los recursos protegidos y solicitar nuevamente la autenticación cuando corresponda.

---

## RF-16 - Historial de ventas

El sistema deberá permitir consultar las ventas registradas.

Para cada venta deberá ser posible visualizar la información general de la operación y los artículos que la componen.

La consulta deberá conservar los valores históricos registrados al momento de realizar la venta.

---

## RF-17 - Configuración de precios

El sistema deberá permitir consultar y modificar los parámetros generales utilizados para calcular los precios correspondientes a los diferentes medios de pago.

La configuración deberá contemplar los parámetros utilizados para:

- precio de tarjeta;
- precio de débito;
- precio de efectivo y transferencia;
- precio de Fast Cred;
- precio de Finan Ya.

Los cambios realizados en la configuración deberán ser utilizados por el backend para calcular los precios de los productos.

La lógica de cálculo deberá permanecer centralizada en el backend.

---

## RF-18 - Gestión y verificación de transferencias

Cuando una venta sea realizada mediante transferencia, el sistema deberá registrar:

- nombre del cliente;
- apellido del cliente;
- teléfono;
- estado de verificación del pago.

Toda transferencia deberá registrarse inicialmente como pendiente de verificación.

El sistema deberá permitir consultar posteriormente estos datos desde el historial de ventas.

El usuario deberá poder marcar una transferencia como verificada una vez comprobada la acreditación del pago.

La verificación deberá modificar únicamente el estado correspondiente y no deberá alterar los importes, detalles ni movimientos de stock de la venta.

---

## RF-19 - Integración del flujo de Fast Cred y Finan Ya

Cuando el usuario seleccione Fast Cred o Finan Ya como medio de pago, el sistema deberá permitir acceder a la plataforma externa correspondiente antes de confirmar la venta.

Las direcciones de dichas plataformas deberán poder configurarse mediante variables de entorno del frontend.

El acceso a la plataforma externa no deberá registrar automáticamente la venta.

Una vez realizada la operación en la plataforma correspondiente, el usuario deberá confirmar en el sistema que completó dicho paso antes de registrar definitivamente la venta.

El registro definitivo de la venta continuará siendo responsabilidad del backend y deberá respetar las mismas validaciones de stock e integridad transaccional aplicadas a los demás medios de pago.

---

## RF-20 - Personalización de la tienda

El sistema deberá permitir configurar:

- el nombre de la tienda;
- un color principal, a elegir entre rosa, celeste, verde, violeta, mostaza y gris;
- la intensidad del color: suave, medio o fuerte.

La configuración deberá aplicarse a la interfaz de la aplicación.

El nombre de la tienda deberá utilizarse en la interfaz y en las etiquetas generadas.

La configuración deberá conservarse entre sesiones.

---

## RF-21 - Diseño de las etiquetas

El sistema deberá permitir definir el diseño de las etiquetas de la mercadería, indicando:

- la forma: rectangular, cuadrada o circular;
- las dimensiones en centímetros;
- los colores de fondo (con la posibilidad de un degradé), de texto, del nombre de la tienda y de los recuadros;
- un subtítulo opcional;
- el estilo: simple, con borde, bordes suaves, relleno sólido o marco doble;
- la fuente y el tamaño de las letras;
- la posición del nombre de la tienda dentro de la etiqueta.

El sistema deberá validar que los valores ingresados sean válidos.

El diseño definido deberá aplicarse a todas las etiquetas que se generen.

---

## RF-22 - Generación e impresión de etiquetas

El sistema deberá permitir generar etiquetas a partir de los productos cargados, sin necesidad de transcribir sus datos manualmente.

El usuario deberá poder:

- buscar un producto por su código;
- seleccionar su variante (talle);
- indicar la cantidad de etiquetas necesarias;
- agregar el producto a una lista de impresión y quitarlo si es necesario.

El sistema deberá mostrar una vista previa de las etiquetas y distribuirlas en hojas listas para imprimir.

Cada etiqueta deberá contener el nombre de la tienda, el subtítulo si fue definido, el código del producto y el talle.

La impresión se realizará mediante el navegador, desde cualquier impresora disponible o enviando el archivo a una librería. El sistema no controla la impresora de forma directa.

---

## RF-23 - Cajas de depósito

El sistema deberá permitir registrar las cajas del depósito y su contenido.

Para cada caja deberá poder registrarse:

- un nombre opcional;
- las variantes de producto que contiene;
- la cantidad de cada una, que deberá ser al menos 1.

El sistema deberá permitir listar, consultar, modificar y eliminar cajas.

Al modificar el contenido de una caja (cambiar cantidades, quitar o agregar productos), su código público no deberá cambiar, de modo que el QR ya impreso y pegado siga funcionando.

Una caja deberá conservar al menos un producto.

El registro de una caja no deberá modificar el stock ni generar movimientos de stock, ya que la mercadería está contabilizada desde su ingreso.

---

## RF-24 - Código QR y consulta pública de una caja

El sistema deberá asignar a cada caja un código público único, que no pueda adivinarse.

El sistema deberá generar un código QR a partir de ese código, para poder imprimirlo y pegarlo en la caja.

Al escanear el QR con la cámara de un celular, deberá abrirse una página que muestre el contenido registrado de la caja (artículos, talles y cantidades), sin necesidad de abrirla físicamente.

Esta consulta no requerirá iniciar sesión y será de solo lectura.

---

## RF-25 - Importación desde Excel

El sistema deberá permitir cargar la información existente en archivos Excel, mediante dos importaciones:

- **Catálogo y precios**: código, descripción, costo, costo extra y proveedor.
- **Stock**: código, color, talle y cantidad.

La importación del catálogo deberá crear los productos que no existan y actualizar los existentes. Los proveedores que no existan deberán crearse.

La importación del stock deberá crear o actualizar las variantes. Si el código no corresponde a un producto existente y la fila incluye prenda, costo y proveedor, el producto deberá crearse, ya que puede tratarse de mercadería nueva.

Al finalizar, el sistema deberá informar cuántas filas se procesaron y cuáles presentaron errores, indicando el motivo.

Un error en una fila no deberá impedir la importación de las demás.

---

## RF-26 - Corrección manual de filas con error

Las filas que no pudieron importarse deberán poder corregirse desde la pantalla de importación, completando o modificando sus datos.

La corrección manual deberá aplicar las mismas validaciones que la importación desde el archivo.

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

## RNF-08 - Separación entre frontend y backend

El frontend y el backend deberán mantenerse desacoplados.

La comunicación entre ambos se realizará mediante HTTP utilizando la API REST.

El frontend será responsable de la presentación de la información, navegación e interacción con el usuario.

Las reglas críticas de negocio, validaciones, cálculos y operaciones sobre el inventario deberán permanecer en el backend.

---

## RNF-09 - Manejo de errores

La aplicación deberá informar de manera comprensible los errores producidos durante las operaciones realizadas por el usuario.

El backend deberá responder utilizando códigos HTTP adecuados y el frontend deberá interpretar dichas respuestas para informar el resultado de la operación.

---

## RNF-10 - Configuración

Las configuraciones dependientes del entorno deberán mantenerse separadas del código fuente cuando corresponda.

La dirección de la API utilizada por el frontend deberá poder configurarse mediante variables de entorno.

Las direcciones de las plataformas externas utilizadas para Fast Cred y Finan Ya deberán poder configurarse mediante variables de entorno del frontend.

Los parámetros correspondientes a las reglas comerciales de cálculo de precios deberán administrarse mediante la configuración de precios persistida por el sistema.

---

## RNF-11 - Build del frontend

El frontend deberá permitir generar correctamente una versión de producción mediante su proceso de build.

La existencia de errores de compilación deberá impedir considerar válida una versión para despliegue.

---

## RNF-12 - Acceso desde otros dispositivos de la red local

El sistema deberá poder utilizarse desde distintos dispositivos (celular, computadora o notebook) conectados a la misma red local que el servidor, mediante un navegador web y sin instalar aplicaciones adicionales.

El frontend deberá detectar automáticamente la dirección del backend a partir del equipo desde el que se abrió la aplicación, de modo que funcione tanto desde ese equipo como desde otro dispositivo de la red.

La apertura del acceso desde otros dispositivos se realiza únicamente en el entorno de desarrollo. En un entorno de producción deberán restringirse los orígenes y los equipos permitidos.

---

## RNF-13 - Seguridad de la consulta pública

La consulta pública del contenido de una caja deberá identificarse mediante un código no adivinable, de modo que no sea posible recorrer las cajas por numeración.

La consulta pública deberá ser de solo lectura. Todas las demás operaciones del sistema deberán requerir autenticación.

---

# Requerimientos futuros

Fuera del alcance de la primera versión se consideran posibles mejoras:

- indicadores semanales y comparativos;
- productos más vendidos;
- talles y colores más vendidos;
- análisis de costos y márgenes;
- reportes avanzados;
- exportación de información;
- stock mínimo configurable;
- roles y permisos específicos;
- despliegue de la aplicación.