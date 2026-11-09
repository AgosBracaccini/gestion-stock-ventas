@echo off
title Sistema de la tienda - NO CERRAR ESTA VENTANA
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
echo Sistema iniciado en el puerto 8000. Dejar esta ventana abierta.
waitress-serve --listen=0.0.0.0:8000 config.wsgi:application
pause