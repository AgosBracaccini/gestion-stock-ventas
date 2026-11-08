from zipfile import BadZipFile

from openpyxl.utils.exceptions import InvalidFileException
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from inventario.importar_excel import validar_archivo_excel

from .importar_ventas import importar_ventas_desde_excel


@api_view(["POST"])
@parser_classes([MultiPartParser])
def importar_ventas(request):
    archivo = request.FILES.get("archivo")
    if not archivo:
        return Response(
            {"detail": "No se envió ningún archivo."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    error = validar_archivo_excel(archivo)
    if error:
        return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

    try:
        resultado = importar_ventas_desde_excel(archivo)
    except (BadZipFile, InvalidFileException, KeyError):
        return Response(
            {"detail": "No se pudo leer el archivo. Verificá que sea un Excel .xlsx válido."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response(resultado)