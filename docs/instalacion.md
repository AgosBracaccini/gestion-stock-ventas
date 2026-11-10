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
- La sesión usa tokens JWT: el de acceso dura 30 minutos y el de renovación 1 día.
- El inicio de sesión admite 5 intentos por minuto; luego se bloquea temporalmente.
- Los archivos de importación deben ser `.xlsx` y pesar hasta 5 MB.
- Las consultas públicas se limitan a la caja (por su código único, que no puede
  adivinarse) y al nombre y color de la tienda. El resto exige iniciar sesión.

## 3. IP fija de la computadora (paso obligatorio antes de imprimir QR)

El código QR de cada caja contiene la dirección de la computadora servidor.
Si el router le asigna otra IP, los QR ya impresos dejan de funcionar.
La dirección también incluye el puerto: los QR deben generarse abriendo el
sistema por `http://<IP>:8000` (modo del local), nunca por `localhost` ni por el
puerto 5173 de desarrollo.

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

En el local el sistema se entrega desde **un único servidor** (puerto 8000):
Django ofrece la API y la aplicación ya compilada, ejecutado con Waitress. No
hace falta Vite ni Visual Studio Code.

Primera vez, y cada vez que se actualiza el sistema:

1. Instalar las dependencias del backend (entorno virtual activo, desde la raíz):

````
   pip install -r requirements.txt
````

2. Aplicar las migraciones (desde `backend`):

````
   python manage.py migrate
````

3. Compilar el frontend (desde `frontend`). Genera la carpeta `frontend/dist`,
   que no se sube al repositorio:

````
   npm install
   npm run build
````

4. Verificar que el `.env` tenga `DEBUG=False` y la IP de la computadora en
   `ALLOWED_HOSTS`.

Arranque: doble clic en `iniciar-tienda.bat` (en la raíz del proyecto). Equivale
a ejecutar, desde `backend` y con el entorno virtual activo:

````
waitress-serve --listen=0.0.0.0:8000 config.wsgi:application
````

La ventana debe quedar abierta mientras se usa el sistema. Desde cualquier
dispositivo de la red se abre `http://<IP de la computadora>:8000`.

El servidor lee la carpeta `frontend/dist` al iniciar: si se vuelve a compilar el
frontend, hay que reiniciarlo.

**Arranque automático.** Para que el sistema inicie solo cuando un usuario inicia
sesión en Windows, y sin ventana visible, se crea una tarea programada desde
PowerShell, ajustando la ruta al proyecto:

````
$accion = New-ScheduledTaskAction -Execute "powershell.exe" -Argument '-NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath ''C:\ruta\al\proyecto\iniciar-tienda.bat'' -WindowStyle Hidden"'
$disparador = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
Register-ScheduledTask -TaskName "Sistema Tienda" -Action $accion -Trigger $disparador
````

Para iniciarlo sin reiniciar la computadora:

````
Start-ScheduledTask -TaskName "Sistema Tienda"
````

Para detenerlo (por ejemplo, antes de actualizar el sistema):

````
Stop-Process -Name waitress-serve -Force
````

Notas:

- El sistema arranca cuando un usuario inicia sesión en Windows. Si nadie inicia
  sesión, no arranca; conviene configurar el inicio de sesión automático.
- Si al registrar la tarea aparece "Acceso denegado", abrir PowerShell como
  administrador y repetir los tres comandos.
- Como el arranque es sin ventana, los errores no se ven. Para diagnosticar,
  ejecutar `iniciar-tienda.bat` con doble clic.

Para desarrollar se siguen usando `runserver` y `npm run dev` (ver `README.md`).

## 5. Verificación

- [ ] Con `DEBUG=False`, `http://<IP>:8000` muestra el login desde la computadora
      y desde un celular.
- [ ] Recargar una pantalla con F5 (por ejemplo, el Dashboard) no da error.
- [ ] Tras reiniciar la computadora, el sistema vuelve a arrancar solo.
- [ ] Se puede iniciar sesión desde la computadora y desde un celular.
- [ ] Se registra una venta de prueba y descuenta el stock.
- [ ] El QR de una caja se abre desde el celular.
- [ ] Una dirección inexistente (`/api/algo-que-no-existe/`) muestra un error
      simple, sin detalles internos.
- [ ] Con `SECRET_KEY` comentada y `DEBUG=False`, el servidor no arranca.
- [ ] Tras 6 contraseñas incorrectas seguidas en un minuto, el login se bloquea.
- [ ] Al imprimir el QR de una caja desde `localhost`, el sistema advierte que no
      funcionará desde un celular.
- [ ] Desde la carpeta `backend`, `python manage.py test` informa que todas las
      pruebas automatizadas pasan (68 al 09/11/2026).

## 6. Limitaciones y mejoras pendientes

- La comunicación usa HTTP, sin cifrar. Para acceder desde fuera de la red del
  local habría que incorporar HTTPS.
- Se usa Waitress con el frontend compilado, sin HTTPS: es adecuado para un
  comercio en red local, no para exponerlo a internet.
- Si se modifica el frontend hay que volver a ejecutar `npm run build` y
  reiniciar el servidor.
- Las copias de seguridad de la base de datos no están automatizadas (ver sección 7).
- Si cambia el router o se restablece de fábrica, hay que repetir la reserva de IP.
- El sistema no distingue roles: todos los usuarios con sesión iniciada tienen los
  mismos permisos. Conviene crear solo los usuarios necesarios.
- La importación de stock reemplaza las cantidades actuales. El sistema pide
  confirmación, pero conviene hacer un respaldo antes de usarla.

## 7. Copia de seguridad manual

Desde PowerShell, ajustando la versión de PostgreSQL, el puerto, el usuario y el
nombre de la base a los de la instalación:


```
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U <usuario> -p <puerto> -Fc -f respaldo.dump <base>
```

Reglas:

- Guardar el archivo **fuera de la carpeta del proyecto** (por ejemplo, en un
  pendrive o en la nube). Contiene los datos del comercio.
- Los archivos `*.dump` están excluidos del repositorio mediante `.gitignore`,
  y nunca deben subirse.
- Hacer un respaldo antes de importar stock, de actualizar el sistema y de
  aplicar migraciones.