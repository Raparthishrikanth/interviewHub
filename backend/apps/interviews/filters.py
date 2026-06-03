import django_filters
from .models import Interview

class InterviewFilter(django_filters.FilterSet):
    date = django_filters.DateFilter(field_name="date", lookup_expr="date")
    date_from = django_filters.DateTimeFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateTimeFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Interview
        fields = ["status", "type", "mode"]
