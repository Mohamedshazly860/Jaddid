# Generated manually to fix date_joined column type

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE accounts_user 
                ALTER COLUMN date_joined TYPE timestamp with time zone 
                USING CASE 
                    WHEN date_joined::text IN ('true', 'false', 't', 'f') THEN current_timestamp 
                    ELSE date_joined::timestamp with time zone 
                END;
            """,
            reverse_sql="""
                ALTER TABLE accounts_user 
                ALTER COLUMN date_joined TYPE boolean;
            """
        ),
    ]
