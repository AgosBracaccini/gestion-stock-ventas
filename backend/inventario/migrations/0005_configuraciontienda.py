# Generated manually, following the pattern of 0004_configuracionprecios.py

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0004_configuracionprecios'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfiguracionTienda',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(default='Mi Tienda', max_length=100)),
                ('color', models.CharField(
                    choices=[
                        ('rosa', 'Rosa'),
                        ('celeste', 'Celeste'),
                        ('verde', 'Verde'),
                        ('violeta', 'Violeta'),
                        ('mostaza', 'Mostaza'),
                        ('gris', 'Gris'),
                    ],
                    default='rosa',
                    max_length=20,
                )),
                ('actualizado', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Configuración de tienda',
                'verbose_name_plural': 'Configuración de tienda',
            },
        ),
    ]