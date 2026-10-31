# Instalación y puesta en marcha en el local

Esta guía resume los pasos para dejar el sistema funcionando en el comercio y
las decisiones de seguridad de la configuración. Aplica a la computadora del
local, que hace de servidor para toda la red (ver `docs/arquitectura.md`).

## 1. Requisitos

- Computadora del local con Windows, Python, Node.js y PostgreSQL instalados.
- Router WiFi del local, al que se conectan la computadora y los celulares.
- El repositorio clonado y las dependencias instaladas (ver `README.md`).

## 2. Configuración (archivo `.env`)

El archivo `.env` está en la raíz del proyecto y **no se sube al repositorio**.
Se parte de `.env.example`. Variables:

| Variable | Para qué sirve |
|---|---|
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Conexión a PostgreSQL |
| `SECRET_KEY` | Clave secreta de Django. Debe ser larga y aleatoria |
| `DEBUG` | `True` solo en desarrollo. En el local debe ser `False` |
| `ALLOWED_HOSTS` | Direcciones desde las que se acepta el acceso (separadas por coma) |
| `CORS_ORIGINS` | Orígenes del frontend permitidos (separados por coma) |

Para generar la `SECRET_KEY`, con el entorno virtual activo:

````
python -c "from django.core.management.utils import get_random_secret_key as g; print(g())"
````

Comportamiento de seguridad ya incorporado:

- Con `DEBUG=False` el servidor **no arranca** si falta `SECRET_KEY`.
- Con `DEBUG=False` los errores no muestran detalles internos del sistema.
- Con `DEBUG=False` solo se aceptan los hosts y orígenes listados en el `.env`.

## 3. IP fija de la computadora (paso obligatorio antes de imprimir QR)

El código QR de cada caja contiene la dirección de la computadora servidor.
Si el router le asigna otra IP, los QR ya impresos dejan de funcionar.

1. En la computadora, ejecutar `ipconfig /all` y anotar la **dirección física**
   del adaptador WiFi y la **puerta de enlace** (dirección del router).
2. Entrar al router desde el navegador (por ejemplo `http://192.168.0.1`).
3. Buscar la sección de reserva de DHCP (también llamada asignación de IP
   estática o *address reservation*).
4. Crear una reserva con la dirección física de la computadora y la IP elegida.
5. Guardar, reiniciar el router si lo pide y verificar con `ipconfig` que la
   computadora conserva esa IP.
6. Completar `ALLOWED_HOSTS` y `CORS_ORIGINS` del `.env` con esa IP.

La reserva se hace en el router, por lo que **se repite en cada comercio o
router distinto**. La computadora sigue obteniendo su IP de forma automática.

## 4. Puesta en marcha

Backend (desde `backend`, con el entorno virtual activo):

````
python manage.py runserver 0.0.0.0:8000
````

Frontend (desde `frontend`):

````
npm run dev -- --host
````

`0.0.0.0` y `--host` permiten que otros dispositivos de la red accedan. Desde
el celular se abre `http://<IP de la computadora>:5173`.

## 5. Verificación

- [ ] Se puede iniciar sesión desde la computadora y desde un celular.
- [ ] Se registra una venta de prueba y descuenta el stock.
- [ ] El QR de una caja se abre desde el celular.
- [ ] Una dirección inexistente (`/api/algo-que-no-existe/`) muestra un error
      simple, sin detalles internos.
- [ ] Con `SECRET_KEY` comentada y `DEBUG=False`, el servidor no arranca.

## 6. Limitaciones y mejoras pendientes

- La comunicación usa HTTP, sin cifrar. Para acceder desde fuera de la red del
  local habría que incorporar HTTPS.
- Se usa el servidor de desarrollo de Django y de Vite. Para un uso más exigente
  conviene un servidor de producción (por ejemplo, Waitress en Windows) y generar
  el frontend compilado.
- Las copias de seguridad de la base de datos no están automatizadas.
- Si cambia el router o se restablece de fábrica, hay que repetir la reserva de IP.