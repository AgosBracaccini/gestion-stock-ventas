# Frontend

## Descripción

El frontend del sistema fue desarrollado con React y TypeScript utilizando Vite como herramienta de desarrollo y construcción.

Su objetivo es proporcionar una interfaz web para operar las funcionalidades implementadas en el backend mediante la API REST desarrollada con Django REST Framework.

El frontend se encarga principalmente de:

- presentar la información al usuario;
- gestionar la navegación;
- administrar la sesión del usuario;
- capturar los datos ingresados;
- consumir los endpoints de la API;
- mostrar los resultados y errores de las operaciones;
- facilitar el acceso a plataformas externas utilizadas durante determinados medios de pago.

Las reglas críticas de negocio permanecen en el backend.

---

## Tecnologías

Las principales tecnologías utilizadas son:

- React
- TypeScript
- Vite
- React Router
- TanStack React Query
- Tailwind CSS
- Lucide React

---

## Arquitectura

El frontend se encuentra separado del backend y se comunica con él mediante HTTP.

```text
Usuario
   ↓
Pages / Components
   ↓
Services
   ↓
Cliente HTTP
   ↓
API REST
   ↓
Django REST Framework
```

Esta separación permite mantener desacopladas las responsabilidades de presentación y negocio.

Los componentes y páginas no acceden directamente a PostgreSQL.

---

## Estructura

La estructura principal del frontend es:

```text
frontend/
│
├── src/
│   ├── api/
│   │   ├── services/
│   │   ├── config.ts
│   │   ├── http.ts
│   │   ├── tokens.ts
│   │   └── types.ts
│   │
│   ├── auth/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

La capa `api` centraliza la comunicación con el backend y evita distribuir URLs y lógica HTTP entre los diferentes componentes.

Los servicios se organizan según las funcionalidades principales del sistema, incluyendo productos, proveedores, ventas, movimientos y configuración de precios.

---

## Configuración

La dirección del backend y las plataformas externas utilizadas durante determinados medios de pago se configuran mediante variables de entorno.

Ejemplo:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_FAST_CRED_URL=https://ventapp.fastcred.ar/login
VITE_FINAN_YA_URL=https://clientes.finanya.com.ar:9634/index.php
```

`VITE_API_URL` indica la dirección de la API desarrollada con Django.

`VITE_FAST_CRED_URL` y `VITE_FINAN_YA_URL` permiten configurar las direcciones de las plataformas externas utilizadas durante el procesamiento de esos medios de pago.

Durante el desarrollo local, la aplicación utiliza normalmente:

```text
Frontend:
http://localhost:5173

Backend:
http://127.0.0.1:8000
```

El backend permite las solicitudes provenientes del frontend mediante una configuración CORS controlada.

---

## Cliente HTTP

La comunicación con Django se encuentra centralizada en un cliente HTTP.

Este componente se encarga de:

- utilizar la URL base configurada;
- enviar solicitudes a la API;
- incorporar el access token cuando corresponde;
- procesar respuestas HTTP;
- intentar renovar la sesión mediante el refresh token;
- informar errores producidos por el backend.

Esto evita implementar la misma lógica de comunicación en cada pantalla.

---

## Autenticación

El sistema utiliza JWT para autenticar usuarios.

Los principales endpoints son:

```text
POST /api/token/
POST /api/token/refresh/
```

Luego de iniciar sesión, las solicitudes a recursos protegidos incorporan:

```text
Authorization: Bearer <access_token>
```

El frontend conserva la información necesaria para mantener la sesión y utiliza el refresh token para solicitar un nuevo access token cuando corresponde.

Cuando la sesión deja de ser válida, el usuario debe volver a autenticarse.

---

## Protección de rutas

Las pantallas internas requieren una sesión autenticada.

El usuario debe iniciar sesión antes de acceder a las funcionalidades principales del sistema.

Las rutas protegidas incluyen las pantallas de:

- dashboard;
- productos y stock;
- ingreso de mercadería;
- nueva venta;
- historial de ventas;
- movimientos;
- proveedores;
- configuración de precios.

---

# Pantallas principales

## Login

Permite autenticar al usuario mediante sus credenciales.

Si las credenciales son válidas, el backend devuelve los tokens JWT necesarios para acceder a los recursos protegidos.

Si la autenticación falla, la interfaz informa el error y no permite ingresar al sistema.

---

## Dashboard

Presenta un resumen de información comercial y de inventario.

Actualmente muestra datos reales obtenidos desde el backend:

- importe vendido durante el día;
- cantidad de operaciones realizadas durante el día;
- importe vendido durante el mes;
- cantidad de operaciones realizadas durante el mes;
- variantes con stock bajo;
- variantes sin stock.

Las métricas se calculan a partir de los datos persistidos en el sistema.

---

## Productos / Stock

Permite consultar productos y sus respectivas variantes.

La información presentada incluye datos como:

- código;
- prenda;
- modelo;
- proveedor;
- estado;
- color;
- talle;
- stock actual.

La pantalla permite además realizar búsquedas y aplicar filtros.

---

## Ingreso de mercadería

Permite registrar ingresos y reposiciones de inventario.

El frontend envía los datos de la operación al backend y este determina cuál de los siguientes escenarios corresponde.

### Producto nuevo

```text
Producto nuevo
      ↓
Nueva variante
      ↓
Incremento de stock
      ↓
Movimiento ENTRADA
```

### Producto existente con variante nueva

```text
Producto existente
      ↓
Nueva variante
      ↓
Incremento de stock
      ↓
Movimiento ENTRADA
```

### Reposición de variante existente

```text
Producto existente
      ↓
Variante existente
      ↓
Incremento de stock
      ↓
Movimiento ENTRADA
```

El frontend no modifica directamente el stock.

---

## Nueva venta

Permite registrar una operación de venta.

El usuario puede:

- buscar productos;
- seleccionar una variante;
- consultar su stock;
- indicar la cantidad;
- agregar uno o múltiples artículos;
- seleccionar el medio de pago;
- visualizar el precio correspondiente;
- completar información adicional cuando el medio de pago lo requiere;
- confirmar la venta.

Al confirmar, el frontend envía al backend la información necesaria para registrar la operación.

El backend se encarga de:

```text
Validar la venta
      ↓
Calcular precios
      ↓
Crear Venta
      ↓
Crear DetalleVenta
      ↓
Descontar stock
      ↓
Crear MovimientoStock VENTA
```

De esta forma, el frontend no replica las reglas críticas de ventas e inventario.

---

## Medios de pago

La pantalla de nueva venta contempla:

- efectivo;
- transferencia;
- tarjeta de débito;
- tarjeta de crédito;
- Fast Cred;
- Finan Ya.

El precio mostrado se actualiza según el medio de pago seleccionado utilizando los valores calculados por el backend.

### Transferencia

Cuando el usuario selecciona transferencia, la interfaz solicita:

- nombre del cliente;
- apellido del cliente;
- teléfono.

Los datos son enviados al backend junto con la venta.

La transferencia queda inicialmente pendiente de verificación y puede ser confirmada posteriormente desde el historial de ventas.

### Fast Cred y Finan Ya

Cuando se selecciona Fast Cred o Finan Ya, el frontend permite acceder a la plataforma externa correspondiente antes de confirmar definitivamente la venta.

El flujo general es:

```text
Seleccionar medio de pago
        ↓
Acceder a plataforma externa
        ↓
Realizar operación externa
        ↓
Regresar al sistema
        ↓
Confirmar que se completó el paso
        ↓
Registrar venta
```

El acceso a la plataforma externa no registra automáticamente una venta.

La operación queda registrada en el sistema únicamente cuando el usuario realiza la confirmación correspondiente.

---

## Historial de ventas

Permite consultar las operaciones registradas.

Para cada venta se puede visualizar:

- fecha;
- medio de pago;
- total;
- productos incluidos;
- código;
- prenda;
- modelo;
- color;
- talle;
- cantidad;
- precio unitario;
- subtotal.

Los importes corresponden a los valores almacenados al momento de realizar cada operación.

Cuando una venta fue realizada mediante transferencia, también se muestran:

- nombre del cliente;
- apellido del cliente;
- teléfono;
- estado de verificación.

Desde esta pantalla una transferencia pendiente puede marcarse como verificada luego de comprobar la acreditación del pago.

La verificación no modifica los detalles, importes ni movimientos de inventario correspondientes a la venta.

---

## Movimientos de stock

Permite consultar el historial de modificaciones del inventario.

Entre los tipos de movimiento se encuentran:

- `ENTRADA`
- `VENTA`
- `AJUSTE`

Los movimientos permiten mantener trazabilidad sobre las modificaciones del stock.

---

## Proveedores

Permite gestionar la información de los proveedores asociados a los productos.

---

## Configuración de precios

Permite consultar y modificar los parámetros generales utilizados por el backend para calcular los precios correspondientes a los diferentes medios de pago.

Desde esta pantalla pueden administrarse los parámetros utilizados para:

- precio de tarjeta;
- precio de débito;
- precio de efectivo y transferencia;
- precio de Finan Ya.

Fast Cred utiliza el mismo precio correspondiente a efectivo/transferencia.

La interfaz no realiza por sí misma los cálculos definitivos de negocio.

Los valores configurados se envían al backend, donde quedan persistidos y son utilizados posteriormente para calcular los precios de los productos.

Esto permite modificar las condiciones comerciales sin necesidad de alterar directamente el código fuente.

---

# Integración frontend/backend

Los principales flujos integrados pueden representarse de la siguiente manera.

## Autenticación

```text
React
  ↓
Credenciales
  ↓
POST /api/token/
  ↓
JWT
  ↓
Sesión autenticada
```

## Ingreso de mercadería

```text
React
  ↓
API REST
  ↓
Django
  ↓
Service de inventario
  ↓
Producto / Variante
  ↓
Stock
  ↓
Movimiento ENTRADA
```

## Venta

```text
React
  ↓
API REST
  ↓
Django
  ↓
Service de venta
  ↓
Venta + Detalles
  ↓
Actualización de stock
  ↓
Movimiento VENTA
```

## Transferencia

```text
React
  ↓
Datos del cliente
  ↓
API REST
  ↓
Venta por transferencia
  ↓
Pendiente de verificación
  ↓
Verificación posterior
```

## Configuración de precios

```text
React
  ↓
API REST
  ↓
Django
  ↓
ConfiguracionPrecios
  ↓
Reglas de cálculo
  ↓
Precios de productos
```

## Dashboard

```text
React
  ↓
API REST
  ↓
Django
  ↓
Consultas sobre ventas e inventario
  ↓
Métricas
```

---

# Manejo de errores

El frontend muestra los errores informados por el backend cuando una operación no puede realizarse.

Entre los casos contemplados se encuentran:

- credenciales incorrectas;
- sesión inválida o expirada;
- stock insuficiente;
- cantidades inválidas;
- productos inactivos;
- variantes inexistentes;
- datos obligatorios faltantes para transferencias;
- datos incorrectos durante una operación;
- problemas de comunicación con la API.

Las validaciones visuales del frontend mejoran la experiencia de usuario, pero no reemplazan las validaciones realizadas por Django.

---

# Decisiones de diseño

## Backend como fuente de verdad

El frontend no calcula ni modifica directamente información crítica como el stock persistente.

Django y PostgreSQL constituyen la fuente de verdad del sistema.

Esto permite evitar inconsistencias entre la interfaz y la información almacenada.

---

## Centralización de la API

Los endpoints y servicios utilizados para comunicarse con Django se encuentran centralizados.

Esto permite modificar la configuración de comunicación sin tener que actualizar individualmente cada componente.

---

## Separación de responsabilidades

La aplicación mantiene una separación entre:

```text
Frontend
→ presentación e interacción

Backend
→ reglas de negocio y validaciones

PostgreSQL
→ persistencia
```

Esta separación facilita el mantenimiento y evolución del sistema.

---

## Plataformas externas de pago

Fast Cred y Finan Ya se utilizan mediante sus respectivas plataformas externas.

El frontend facilita el acceso a dichas plataformas, pero no implementa una integración directa con sus APIs.

Esta decisión mantiene separado el procesamiento externo del pago del registro interno de la venta.

La venta solo se registra cuando el usuario confirma dentro del sistema que completó el paso correspondiente.

---

## Simplificación de la infraestructura frontend

La interfaz fue inicialmente prototipada utilizando una herramienta de generación asistida.

Durante la integración se revisó y simplificó la arquitectura generada, conservando las pantallas, componentes y servicios necesarios.

El frontend quedó estructurado como una aplicación React + Vite independiente.

Se eliminó infraestructura adicional, datos simulados y dependencias de prototipado que dejaron de ser necesarias una vez completada la integración con el backend Django.

---

# Build

El frontend permite generar una versión de producción mediante:

```bash
npm run build
```

El proceso de build fue verificado durante el desarrollo.

La versión actual compila correctamente para producción mediante Vite.