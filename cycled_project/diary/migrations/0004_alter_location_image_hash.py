# Generated by Django 5.0.6 on 2025-04-26 07:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("diary", "0003_alter_location_lat_alter_location_lon"),
    ]

    operations = [
        migrations.AlterField(
            model_name="location",
            name="image_hash",
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]
