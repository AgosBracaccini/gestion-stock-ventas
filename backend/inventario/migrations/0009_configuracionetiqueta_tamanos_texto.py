from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0008_configuracionetiqueta_estilo_fuente_colores'),
    ]

    operations = [
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='tamano_texto_tienda',
            field=models.PositiveSmallIntegerField(default=10),
        ),
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='tamano_texto_codigo',
            field=models.PositiveSmallIntegerField(default=14),
        ),
    ]