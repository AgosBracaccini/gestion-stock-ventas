from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0006_configuraciontienda_intensidad'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfiguracionEtiqueta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('forma', models.CharField(
                    choices=[
                        ('rectangular', 'Rectangular'),
                        ('cuadrada', 'Cuadrada'),
                        ('circular', 'Circular'),
                    ],
                    default='rectangular',
                    max_length=20,
                )),
                ('ancho_cm', models.DecimalField(decimal_places=1, default=5.0, max_digits=4)),
                ('alto_cm', models.DecimalField(decimal_places=1, default=3.0, max_digits=4)),
                ('color_fondo', models.CharField(default='#ffffff', max_length=7)),
                ('color_texto', models.CharField(default='#1a1a1a', max_length=7)),
                ('posicion_nombre', models.CharField(
                    choices=[
                        ('arriba_izquierda', 'Arriba izquierda'),
                        ('arriba_centro', 'Arriba centro'),
                        ('arriba_derecha', 'Arriba derecha'),
                        ('centro_izquierda', 'Centro izquierda'),
                        ('centro', 'Centro'),
                        ('centro_derecha', 'Centro derecha'),
                        ('abajo_izquierda', 'Abajo izquierda'),
                        ('abajo_centro', 'Abajo centro'),
                        ('abajo_derecha', 'Abajo derecha'),
                    ],
                    default='arriba_centro',
                    max_length=20,
                )),
                ('actualizado', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Configuración de etiqueta',
                'verbose_name_plural': 'Configuración de etiqueta',
            },
        ),
    ]