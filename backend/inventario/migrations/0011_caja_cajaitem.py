import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0010_configuracionetiqueta_subtitulo_gradiente'),
    ]

    operations = [
        migrations.CreateModel(
            name='Caja',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo_publico', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('nombre', models.CharField(blank=True, default='', max_length=100)),
                ('creado', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-creado'],
            },
        ),
        migrations.CreateModel(
            name='CajaItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.PositiveIntegerField()),
                ('caja', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='inventario.caja')),
                ('variante', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='items_en_cajas', to='inventario.varianteproducto')),
            ],
        ),
    ]