from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0005_configuraciontienda'),
    ]

    operations = [
        migrations.AddField(
            model_name='configuraciontienda',
            name='intensidad',
            field=models.CharField(
                choices=[
                    ('suave', 'Suave'),
                    ('medio', 'Medio'),
                    ('fuerte', 'Fuerte'),
                ],
                default='medio',
                max_length=20,
            ),
        ),
    ]