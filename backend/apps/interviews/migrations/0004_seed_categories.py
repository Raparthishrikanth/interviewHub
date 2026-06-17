from django.db import migrations

def seed_categories(apps, schema_editor):
    InterviewCategory = apps.get_model('interviews', 'InterviewCategory')
    defaults = [
        ('TECHNICAL', 'L1'),
        ('TECHNICAL', 'L2'),
        ('HR', 'Screening'),
        ('HR', 'Cultural Fit'),
        ('MANAGERIAL', 'Technical Managerial'),
        ('MANAGERIAL', 'Project Managerial'),
        ('CULTURE_FIT', 'Values Alignment'),
        ('FINAL_ROUND', 'Director Round'),
    ]
    for type_choice, name in defaults:
        InterviewCategory.objects.get_or_create(type=type_choice, name=name)

def reverse_seed(apps, schema_editor):
    InterviewCategory = apps.get_model('interviews', 'InterviewCategory')
    InterviewCategory.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('interviews', '0003_interview_category_interviewcategory'),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_seed),
    ]
