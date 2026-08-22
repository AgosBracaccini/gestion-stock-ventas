# Sistema de Gestión de Ventas y Stock

Aplicación web para la gestión de ventas, productos e inventario de una tienda de indumentaria.

El proyecto surge a partir del análisis de un proceso real actualmente gestionado mediante diferentes hojas de cálculo. El objetivo es centralizar la información, reducir tareas manuales y mantener actualizado el stock automáticamente a partir de las operaciones realizadas.

> Los datos utilizados en el repositorio son ficticios. No se publica información comercial real del negocio analizado.

## Problema

Actualmente, la gestión se realiza mediante diferentes archivos y hojas de cálculo para productos, precios, ventas y stock.

Entre los principales problemas identificados se encuentran:

- actualización manual del stock;
- información distribuida entre diferentes archivos;
- posibilidad de inconsistencias entre ventas y existencias;
- procesos manuales durante el registro de ventas;
- falta de trazabilidad sobre los movimientos del inventario;
- dificultad para obtener información consolidada sobre ventas y stock.

## Solución propuesta

Desarrollar una aplicación web que permita centralizar la gestión de:

- proveedores;
- productos;
- variantes por color y talle;
- precios según medio de pago;
- inventario;
- movimientos de stock;
- ingreso y reposición de mercadería;
- ventas y sus detalles.

Al confirmar una venta, el sistema valida la disponibilidad, calcula los importes correspondientes, registra la operación, descuenta automáticamente el stock y genera el movimiento de inventario asociado.

## Tecnologías

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- django-filter
- django-cors-headers
- drf-spectacular
- OpenAPI / Swagger

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack React Query
- Tailwind CSS
- Componentes UI reutilizables

## Arquitectura

La aplicación se encuentra separada en frontend y backend.

```text
Usuario
   ↓
React + Vite
   ↓
Cliente HTTP / JWT
   ↓
API REST
   ↓
Django REST Framework
   ↓
Services
   ↓
Models
   ↓
PostgreSQL
```

El frontend se encarga de la interfaz de usuario, la navegación, la gestión de la sesión y el consumo de la API REST.

El backend concentra las reglas de negocio, validaciones, cálculos, operaciones transaccionales y persistencia de datos.

Los `services` contienen las operaciones de negocio que involucran múltiples acciones, como el registro de una venta, el ingreso de mercadería y las actualizaciones correspondientes del inventario.

Las operaciones críticas se ejecutan mediante transacciones para evitar modificaciones parciales de la información ante un error.

Las reglas críticas de negocio permanecen en el backend y no se duplican en el frontend.

## Modelo de datos

El sistema utiliza las siguientes entidades principales:

- Proveedor
- Producto
- VarianteProducto
- MovimientoStock
- Venta
- DetalleVenta

![Diagrama Entidad-Relación](docs/images/diagrama-er.png)

La separación entre `Producto` y `VarianteProducto` permite representar diferentes combinaciones de color y talle manteniendo un único código general de producto.

La entidad `MovimientoStock` conserva el historial de las modificaciones del inventario, mientras que `stock_actual` permite consultar rápidamente la disponibilidad de cada variante.

## Funcionalidades implementadas

### Autenticación

- Inicio de sesión mediante JWT.
- Access token y refresh token.
- Renovación automática de sesión.
- Rutas protegidas.
- Cierre de sesión.
- Manejo de sesión expirada.

### Productos e inventario

- Gestión de proveedores.
- Gestión de productos.
- Variantes por color y talle.
- Código único por producto.
- Combinación única producto + color + talle.
- Consulta de stock actual.
- Búsqueda de productos y variantes.
- Filtros por proveedor, estado, color y talle.
- Identificación de variantes con stock bajo o sin stock.

### Ingreso de mercadería

El sistema contempla tres escenarios:

1. Producto nuevo + variante nueva.
2. Producto existente + variante nueva.
3. Producto existente + variante existente.

En una reposición de una variante existente se incrementa el stock sin crear registros duplicados.

Los datos generales de un producto existente no se modifican automáticamente durante una reposición.

Cada ingreso genera un movimiento de stock de tipo `ENTRADA`.

### Ventas

- Registro de ventas con uno o múltiples artículos.
- Selección de variantes por color y talle.
- Consulta de stock disponible.
- Selección del medio de pago.
- Visualización del precio correspondiente al medio de pago.
- Cálculo automático de subtotales y total.
- Validación de stock.
- Rechazo de cantidades inválidas.
- Rechazo de productos inactivos.
- Rechazo de variantes inexistentes.
- Rechazo de variantes repetidas dentro de una venta.
- Descuento automático del stock.
- Generación automática de movimientos `VENTA`.
- Operaciones transaccionales con rollback ante errores.

### Medios de pago

- Efectivo.
- Transferencia.
- Tarjeta de débito.
- Tarjeta de crédito.
- Fast Cred.
- Finan Ya.

### Consultas e historial

- Historial de ventas.
- Detalle de artículos de cada venta.
- Historial de movimientos de stock.
- Dashboard con importe vendido durante el día.
- Dashboard con importe vendido durante el mes.
- Cantidad de operaciones del día y del mes.
- Indicadores de stock bajo y sin stock.

### API y calidad

- API REST desarrollada con Django REST Framework.
- Persistencia mediante PostgreSQL.
- Documentación OpenAPI / Swagger.
- CORS configurado para la comunicación con el frontend.
- Manejo de errores HTTP.
- Pruebas automatizadas del backend.
- Validación del rollback transaccional.
- Build de producción del frontend verificado.

## Reglas de negocio principales

- El código de cada producto debe ser único.
- La combinación producto + color + talle debe ser única.
- Una reposición de mercadería de un código existente no modifica automáticamente los datos generales del producto.
- No se permite vender una cantidad superior al stock disponible.
- No se permiten cantidades de venta iguales o inferiores a cero.
- Una venta debe contener al menos un artículo.
- Una misma variante no puede aparecer más de una vez dentro de una misma venta.
- No se permite vender un producto inactivo.
- No se permite realizar una venta utilizando una variante inexistente.
- Los cambios producidos por una venta se ejecutan dentro de una única transacción.
- Ante un error durante una venta, la operación completa se revierte.
- Los movimientos históricos de stock no pueden crearse libremente desde la API general.
- Los productos pueden desactivarse sin eliminar su información histórica.
- Los endpoints protegidos requieren un usuario autenticado.

## Cálculo de precios

Las reglas utilizadas actualmente fueron obtenidas a partir del análisis del proceso existente:

```text
Precio tarjeta = (Costo × 2,5) + Costo extra
Precio débito = Precio tarjeta - 15 %
Precio efectivo / transferencia = Precio tarjeta - 20 %
Precio Fast Cred = Precio efectivo
Precio Finan Ya = Precio efectivo + 5 %
```

El costo y el costo extra pertenecen a cada producto y pueden variar entre productos.

Las fórmulas de precios cuentan con pruebas automatizadas para verificar que los cálculos continúen respetando las reglas definidas.

En futuras versiones estas reglas podrán convertirse en parámetros configurables.

## Autenticación

La API utiliza autenticación mediante JSON Web Tokens (JWT).

El usuario obtiene un `access token` y un `refresh token` mediante:

```text
POST /api/token/
```

El access token debe enviarse en las solicitudes a endpoints protegidos mediante el encabezado:

```text
Authorization: Bearer <access_token>
```

Cuando el access token expira puede obtenerse uno nuevo mediante:

```text
POST /api/token/refresh/
```

El frontend administra la sesión y realiza la renovación automática del access token cuando corresponde.

Los endpoints principales de inventario y ventas requieren autenticación.

## Documentación de la API

Durante el desarrollo, Swagger se encuentra disponible en:

```text
http://127.0.0.1:8000/api/docs/
```

El esquema OpenAPI se encuentra disponible en:

```text
http://127.0.0.1:8000/api/schema/
```

Swagger permite explorar y probar los endpoints de la API, incluyendo aquellos protegidos mediante JWT.

## Pruebas automatizadas

El backend cuenta con pruebas automatizadas para las principales reglas de negocio.

Entre los comportamientos comprobados se encuentran:

- operaciones de inventario;
- creación de productos y variantes mediante el ingreso de mercadería;
- reposición de variantes existentes;
- actualización del stock;
- protección de los datos generales del producto durante una reposición;
- registro de ventas;
- descuento automático de stock;
- generación de movimientos de inventario;
- rechazo de ventas con stock insuficiente;
- rechazo de variantes inexistentes;
- rechazo de productos inactivos;
- rechazo de variantes duplicadas dentro de una venta;
- rollback completo ante errores durante una operación;
- cálculo de precios según medio de pago;
- acceso protegido mediante JWT;
- acceso exitoso de usuarios autenticados.

Para ejecutar todos los tests:

```bash
cd backend
python manage.py test
```

## CORS

Durante el desarrollo local, el backend permite solicitudes provenientes del frontend ejecutado mediante Vite en:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Esta configuración permite desarrollar frontend y backend de manera independiente manteniendo la API protegida.

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/AgosBracaccini/gestion-stock-ventas
cd gestion-stock-ventas
```

### 2. Crear y activar el entorno virtual del backend

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Instalar las dependencias del backend

```bash
pip install -r requirements.txt
```

### 4. Configurar las variables de entorno del backend

Crear un archivo `.env` en la raíz tomando como referencia `.env.example`.

```env
DB_NAME=gestion_tienda
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5433
```

Los valores deben adaptarse a la configuración local de PostgreSQL.

### 5. Aplicar las migraciones

```bash
cd backend
python manage.py migrate
```

### 6. Crear un usuario administrador

```bash
python manage.py createsuperuser
```

Este usuario puede utilizarse para acceder a Django Admin y autenticarse inicialmente contra la API.

### 7. Ejecutar el backend

Desde la carpeta `backend`:

```bash
python manage.py runserver
```

El backend estará disponible en:

```text
http://127.0.0.1:8000/
```

### 8. Instalar las dependencias del frontend

Abrir una segunda terminal y ubicarse en la carpeta `frontend`:

```bash
cd frontend
npm install
```

### 9. Configurar las variables de entorno del frontend

Crear un archivo `.env` dentro de `frontend`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_USE_MOCKS=false
```

### 10. Ejecutar el frontend

Desde la carpeta `frontend`:

```bash
npm run dev
```

El frontend estará disponible en:

```text
http://localhost:5173/
```

Para utilizar el sistema durante el desarrollo deben permanecer ejecutándose simultáneamente el backend y el frontend.

## Build del frontend

Para verificar o generar el build de producción:

```bash
cd frontend
npm run build
```

## Estructura general

```text
gestion-stock-ventas/
│
├── backend/
│   ├── config/
│   ├── inventario/
│   ├── ventas/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── docs/
│   ├── images/
│   ├── as-is.md
│   ├── modelo-datos.md
│   └── requerimientos.md
│
├── .env.example
├── requirements.txt
└── README.md
```

## Documentación adicional

En la carpeta [`docs`](docs/) se encuentra documentación relacionada con:

- análisis de la situación inicial (AS-IS);
- requerimientos del sistema;
- modelo de datos;
- decisiones de diseño;
- arquitectura e integración del sistema.

## Estado del proyecto

### V1 funcional

La primera versión funcional del sistema se encuentra implementada e integrada.

Actualmente funcionan de manera conjunta:

```text
React + Vite
      ↓
API REST
      ↓
Django REST Framework
      ↓
PostgreSQL
```

Se encuentran implementados y probados los principales flujos del sistema:

- autenticación;
- consulta de productos y stock;
- ingreso de productos nuevos;
- creación de nuevas variantes;
- reposición de stock;
- registro de ventas;
- cálculo de precios según medio de pago;
- actualización automática del inventario;
- generación y consulta de movimientos de stock;
- historial de ventas;
- dashboard con información real.

### Próximas mejoras

La V1 funcional constituye la base del sistema. Se prevé incorporar funcionalidades adicionales y mejoras antes de considerar cerrado el desarrollo del proyecto.

Entre las posibles extensiones se encuentran:

- reportes e indicadores avanzados;
- exportación de información;
- roles y permisos específicos;
- stock mínimo configurable;
- parametrización de reglas de precios;
- despliegue de la aplicación.

## Autor

Agostina Bracaccini

Proyecto desarrollado como parte de la construcción de un portfolio personal orientado al desarrollo de software.