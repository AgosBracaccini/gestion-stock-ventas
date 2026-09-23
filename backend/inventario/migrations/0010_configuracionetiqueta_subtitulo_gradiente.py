from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0009_configuracionetiqueta_tamanos_texto'),
    ]

    operations = [
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='color_fondo_2',
            field=models.CharField(default='#ffffff', max_length=7),
        ),
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='subtitulo',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]