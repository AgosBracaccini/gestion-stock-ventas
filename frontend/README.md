# Pastel Stock

Quiero crear el frontend de una aplicación web para la gestión de ventas, productos e inventario de una tienda de indumentaria.

IMPORTANTE:

- El backend YA EXISTE.

- Está desarrollado con Django + Django REST Framework.

- La base de datos es PostgreSQL.

- La autenticación es JWT.

- La API REST ya está implementada y documentada con Swagger.

- NO crear backend.

- NO crear Supabase.

- NO crear una base de datos nueva.

- NO inventar lógica de negocio que ya corresponde al backend.

- El frontend debe consumir una API REST existente.

- Quiero React como frontend.

Nombre visual provisorio de la aplicación:

“Indumentaria”

No usar logo por ahora.

La identidad visual debe ser limpia, moderna, femenina y profesional, utilizando rosa pastel como color principal, combinado con blanco, gris muy claro y tonos neutros. Evitar un diseño infantil o demasiado recargado.

OBJETIVO DEL SISTEMA

La aplicación reemplaza un proceso actual basado en diferentes hojas de Excel para precios, ventas y stock.

Debe permitir:

- gestionar productos;

- gestionar variantes por color y talle;

- consultar stock;

- ingresar y reponer mercadería;

- registrar ventas;

- calcular precios según medio de pago;

- consultar movimientos de stock;

- consultar historial de ventas;

- buscar y filtrar productos;

- visualizar productos con bajo stock o sin stock.

MODELO DE DATOS

Las entidades principales son:

1. Proveedor

- id

- nombre

Relación:

Proveedor 1:N Producto

2. Producto

- id

- proveedor

- codigo

- prenda

- modelo

- descripcion

- costo

- costo_extra

- activo

Reglas:

- codigo es único;

- un producto puede tener múltiples variantes;

- un producto puede estar activo o inactivo.

3. VarianteProducto

- id

- producto

- color

- talle

- stock_actual

Reglas:

- la combinación producto + color + talle es única;

- cada variante tiene su propio stock.

4. MovimientoStock

- id

- variante_producto

- fecha

- tipo_movimiento

- cantidad

- observacion

Tipos:

- ENTRADA

- VENTA

- AJUSTE

5. Venta

- id

- fecha

- medio_pago

- total

Medios de pago:

- EFECTIVO

- TRANSFERENCIA

- DEBITO

- CREDITO

- FAST_CRED

- FINAN_YA

6. DetalleVenta

- id

- venta

- variante_producto

- cantidad

- precio_unitario

- subtotal

REGLAS DE NEGOCIO IMPORTANTES

- Una venta puede contener uno o varios artículos.

- No se puede vender una cantidad mayor al stock disponible.

- No se puede vender un producto inactivo.

- No se puede utilizar una variante inexistente.

- Una misma variante no debe aparecer dos veces dentro de una misma venta.

- Al confirmar una venta, el backend descuenta automáticamente el stock.

- Al confirmar una venta, el backend crea automáticamente un MovimientoStock de tipo VENTA.

- Las ventas se procesan transaccionalmente en backend.

- El frontend NO debe recalcular ni modificar manualmente el stock.

- El frontend NO debe implementar la lógica crítica de negocio; debe consumir las respuestas del backend.

PRECIOS

El backend calcula automáticamente:

Precio tarjeta = (Costo × 2.5) + Costo extra

Precio débito = Precio tarjeta - 15%

Precio efectivo / transferencia = Precio tarjeta - 20%

Precio Fast Cred = Precio efectivo

Precio Finan Ya = Precio efectivo + 5%

El frontend debe mostrar estos precios, pero NO debe recalcularlos si la API ya los devuelve.

AUTENTICACIÓN

La aplicación utiliza JWT.

Login:

POST /api/token/

Request:

{

  "username": "...",

  "password": "..."

}

Response:

{

  "access": "...",

  "refresh": "..."

}

Refresh:

POST /api/token/refresh/

Los endpoints protegidos requieren:

Authorization: Bearer <access_token>

Quiero una arquitectura frontend preparada para:

- guardar la sesión;

- adjuntar automáticamente el access token en las solicitudes;

- renovar el access token usando refresh token;

- redirigir al login si la sesión deja de ser válida.

PANTALLAS PRINCIPALES

1. LOGIN

Pantalla sencilla y elegante.

Debe incluir:

- nombre “Indumentaria”;

- usuario;

- contraseña;

- botón “Iniciar sesión”;

- mensaje claro cuando las credenciales sean incorrectas.

No permitir acceso a las demás pantallas sin autenticación.

2. DASHBOARD

Debe ser la pantalla principal luego del login.

Diseñar tarjetas preparadas para mostrar:

- ventas de hoy;

- ventas del mes;

- productos con stock bajo;

- productos sin stock.

También incluir accesos rápidos:

- Nueva venta;

- Ingresar mercadería;

- Productos;

- Stock.

Si todavía no existe un endpoint para alguna estadística, dejar el componente preparado visualmente pero NO inventar datos reales. Se pueden utilizar placeholders claramente identificados durante el diseño.

3. NUEVA VENTA

Esta es una de las pantallas más importantes.

Flujo:

- permitir ingresar o buscar el código del producto;

- mostrar el producto encontrado;

- mostrar las variantes disponibles según color y talle;

- mostrar stock disponible;

- seleccionar una variante;

- indicar cantidad;

- agregar artículo a la venta;

- permitir agregar varios artículos;

- impedir visualmente agregar la misma variante dos veces;

- mostrar los precios disponibles según medio de pago;

- seleccionar medio de pago;

- mostrar subtotal por artículo;

- mostrar total;

- botón principal “Confirmar venta”.

Al confirmar, utilizar:

POST /api/ventas/

Formato esperado:

{

  "medio_pago": "EFECTIVO",

  "items": [

    {

      "variante_id": 1,

      "cantidad": 1

    }

  ]

}

Mostrar mensajes claros de backend, por ejemplo:

- stock insuficiente;

- variante inexistente;

- producto inactivo;

- sesión expirada.

Después de una venta exitosa:

- mostrar confirmación;

- limpiar el formulario;

- actualizar la información de stock visible.

4. PRODUCTOS / STOCK

Pantalla con buscador y tabla.

Mostrar:

- código;

- prenda;

- modelo;

- proveedor;

- color;

- talle;

- stock actual;

- estado.

Permitir búsqueda por:

- código;

- prenda;

- modelo;

- color;

- talle.

Permitir filtros:

- proveedor;

- activo/inactivo;

- color;

- talle.

Identificar visualmente:

- stock normal;

- stock bajo;

- sin stock.

No usar colores agresivos. Mantener la estética pastel y profesional.

5. INGRESO DE MERCADERÍA

Formulario para ingresar mercadería.

Campos:

- código;

- prenda;

- modelo;

- descripción;

- color;

- talle;

- cantidad;

- costo;

- costo extra;

- proveedor.

Debe permitir los siguientes comportamientos según lo que responda la API:

A. Producto nuevo + variante nueva.

B. Producto existente + variante nueva.

C. Producto existente + variante existente → reposición de stock.

Si el producto ya existe, el frontend debe dejar claro que se está realizando una reposición y evitar confundir esa operación con una edición del producto.

6. HISTORIAL DE VENTAS

Tabla con:

- número/id;

- fecha;

- medio de pago;

- total.

Al seleccionar una venta, mostrar sus detalles:

- producto;

- color;

- talle;

- cantidad;

- precio unitario;

- subtotal.

7. MOVIMIENTOS DE STOCK

Tabla con:

- fecha;

- producto/variante;

- tipo de movimiento;

- cantidad;

- observación.

Permitir diferenciar visualmente ENTRADA, VENTA y AJUSTE.

8. PROVEEDORES

Pantalla sencilla de gestión de proveedores:

- listado;

- búsqueda;

- alta;

- edición.

NAVEGACIÓN

Usar un layout con sidebar lateral en escritorio.

Opciones:

- Dashboard

- Nueva venta

- Productos / Stock

- Ingreso de mercadería

- Ventas

- Movimientos

- Proveedores

- Cerrar sesión

En pantallas pequeñas, convertir el sidebar en menú desplegable.

DISEÑO VISUAL

Estética:

- moderna;

- limpia;

- profesional;

- femenina sin ser infantil;

- mucho espacio en blanco;

- tarjetas con bordes suaves;

- sombras muy discretas;

- bordes redondeados moderados.

Paleta:

- rosa pastel como color principal;

- blanco;

- gris muy claro;

- texto gris oscuro;

- tonos neutros complementarios.

No usar fucsia fuerte ni colores saturados.

Tipografía:

- moderna y legible;

- jerarquía clara entre títulos, subtítulos y contenido.

Botones principales:

- rosa pastel;

- texto con buen contraste;

- estados hover discretos.

TABLAS

Las tablas deben:

- ser fáciles de leer;

- tener buscador visible;

- filtros claros;

- diseño responsive;

- acciones simples;

- evitar exceso de información.

EXPERIENCIA DE USUARIO

Priorizar rapidez porque el sistema será utilizado durante una venta real.

La pantalla Nueva Venta debe minimizar clics.

Ejemplo:

escribir código → elegir variante → cantidad → agregar → medio de pago → confirmar.

Mostrar loading states mientras se esperan respuestas de la API.

Mostrar mensajes de éxito y error claros.

No ocultar errores provenientes del backend.

ARQUITECTURA FRONTEND

Organizar el código de forma mantenible.

Separar al menos:

- pages;

- components;

- services o api;

- auth;

- hooks cuando sea necesario.

Crear una configuración centralizada para la URL de la API.

Usar variables de entorno, por ejemplo:

VITE_API_URL=http://127.0.0.1:8000

Crear un cliente HTTP reutilizable para:

- baseURL;

- JWT;

- manejo de errores;

- refresh token.

No colocar llamadas HTTP directamente por toda la aplicación si pueden centralizarse.

IMPORTANTE

Primero quiero generar la estructura visual y funcional del frontend.

No inventar endpoints que no hayan sido definidos.

No usar Supabase.

No crear una base de datos.

No reemplazar Django.

No crear lógica de stock paralela en frontend.

No crear valores de venta ficticios como si fueran datos reales.

Cuando sea necesario utilizar datos simulados para diseñar una pantalla, deben estar claramente separados del servicio API para poder reemplazarlos fácilmente por datos reales.

El proyecto debe quedar preparado para conectarse con un backend Django REST existente.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f6dc6292-7e76-490f-a180-d59df560bcdb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
