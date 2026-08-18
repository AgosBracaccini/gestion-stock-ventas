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

El frontend se incorporará en la siguiente etapa del proyecto utilizando React.

## Arquitectura del backend

El backend separa las diferentes responsabilidades de la aplicación:

```text
Cliente / Frontend
       ↓
    API REST
       ↓
Autenticación JWT
       ↓
     Views
       ↓
  Serializers
       ↓
    Services
       ↓
     Models
       ↓
  PostgreSQL
```

Los `services` contienen las operaciones de negocio que involucran múltiples acciones, como el registro de una venta, el ingreso de mercadería y las actualizaciones correspondientes del inventario.

Las operaciones críticas se ejecutan mediante transacciones para evitar modificaciones parciales de la información ante un error.

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

Actualmente se encuentran implementadas:

- gestión de proveedores;
- gestión de productos;
- gestión de variantes por color y talle;
- cálculo automático de precios según medio de pago;
- ingreso y reposición de mercadería;
- creación automática de variantes durante el ingreso de mercadería;
- reposición de stock sin sobrescribir los datos existentes del producto;
- registro de ventas con múltiples artículos;
- validación de stock disponible;
- actualización automática del stock al realizar una venta;
- generación automática de movimientos de stock;
- transacciones atómicas para evitar operaciones parcialmente procesadas;
- búsqueda de productos y variantes;
- filtros por proveedor, estado, color y talle;
- consulta de variantes con stock bajo o sin stock;
- autenticación mediante JWT;
- generación de access token y refresh token;
- protección de los endpoints mediante autenticación;
- manejo de errores de negocio mediante respuestas HTTP apropiadas;
- API REST para inventario y ventas;
- documentación interactiva mediante Swagger/OpenAPI;
- configuración CORS para la integración con el frontend;
- administración mediante Django Admin;
- pruebas automatizadas de reglas de negocio, inventario, ventas, precios y autenticación;
- validación mediante tests del rollback transaccional.

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

Los endpoints principales de inventario y ventas requieren autenticación.

## Documentación de la API

Durante el desarrollo, Swagger se encuentra disponible en:

```text
/api/docs/
```

El esquema OpenAPI se encuentra disponible en:

```text
/api/schema/
```

Swagger permite explorar y probar los endpoints de la API, incluyendo aquellos protegidos mediante JWT.

## Pruebas automatizadas

El backend cuenta actualmente con 20 pruebas automatizadas.

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

### 2. Crear y activar un entorno virtual

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Instalar las dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar las variables de entorno

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

### 7. Ejecutar el servidor

```bash
python manage.py runserver
```

El backend estará disponible por defecto en:

```text
http://127.0.0.1:8000/
```

## Documentación adicional

En la carpeta [`docs`](docs/) se encuentra documentación relacionada con:

- análisis de la situación inicial (AS-IS);
- requerimientos;
- modelo de datos;
- decisiones de diseño.

## Estado del proyecto

### Backend V1

La primera versión funcional del backend se encuentra implementada.

Incluye gestión de inventario y ventas, reglas de negocio, autenticación JWT, persistencia en PostgreSQL, documentación de la API y pruebas automatizadas.

### Próxima etapa

Desarrollo del frontend en React e integración con la API REST.

Entre las mejoras posteriores previstas se encuentran:

- dashboards e indicadores;
- roles y permisos específicos;
- stock mínimo configurable;
- parametrización de las reglas de precios;
- reportes y exportación de información;
- despliegue de la aplicación.

## Autor

Agostina Bracaccini

Proyecto desarrollado como parte de la construcción de un portfolio personal orientado al desarrollo de software.