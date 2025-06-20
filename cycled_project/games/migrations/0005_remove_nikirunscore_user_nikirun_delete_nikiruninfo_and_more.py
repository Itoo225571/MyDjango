# Generated by Django 5.0.6 on 2025-05-10 04:03

import django.db.models.deletion
import games.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0004_nikiruninfo"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name="nikirunscore",
            name="user",
        ),
        migrations.CreateModel(
            name="NIKIRun",
            fields=[
                (
                    "score_id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                ("score", models.FloatField()),
                ("not_play_yet", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("character", models.CharField(default="PigMan", max_length=16)),
                (
                    "owned_characters",
                    models.JSONField(default=games.models.default_owned_characters),
                ),
                ("bronze_coin", models.IntegerField()),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.DeleteModel(
            name="NIKIRunInfo",
        ),
        migrations.DeleteModel(
            name="NIKIRunScore",
        ),
    ]
