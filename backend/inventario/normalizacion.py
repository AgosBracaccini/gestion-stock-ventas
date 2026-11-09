"""
Normalización de color y talle, para que "azul", "Azul " y "AZUL" sean
la misma variante y no se dupliquen al ingresar mercadería o importar
excels.
"""

import re


def _limpiar(texto):
    return re.sub(r"\s+", " ", str(texto or "").strip())


def normalizar_color(color):
    """'  azul   MARINO ' -> 'Azul marino'"""
    texto = _limpiar(color)
    return texto[:1].upper() + texto[1:].lower()


def normalizar_talle(talle):
    """' xl ' -> 'XL'"""
    return _limpiar(talle).upper()