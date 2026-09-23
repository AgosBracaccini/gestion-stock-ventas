from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0007_configuracionetiqueta'),
    ]

    operations = [
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='color_texto_tienda',
            field=models.CharField(default='#1a1a1a', max_length=7),
        ),
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='color_rectangulos',
            field=models.CharField(default='#f2f2f2', max_length=7),
        ),
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='estilo',
            field=models.CharField(
                choices=[
                    ('simple', 'Simple'),
                    ('con_borde', 'Con borde'),
                    ('bordes_suaves', 'Bordes suaves'),
                    ('relleno_solido', 'Relleno sólido'),
                    ('marco_doble', 'Marco doble'),
                ],
                default='simple',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='configuracionetiqueta',
            name='fuente',
            field=models.CharField(
                choices=[
                    ('georgia', 'Georgia'),
                    ('times', 'Times New Roman'),
                    ('arial', 'Arial'),
                    ('verdana', 'Verdana'),
                    ('courier', 'Courier New'),
                    ('trebuchet', 'Trebuchet MS'),
                ],
                default='arial',
                max_length=20,
            ),
        ),
    ]