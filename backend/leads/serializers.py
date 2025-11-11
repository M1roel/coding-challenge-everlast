from rest_framework import serializers
from .models import Tenant, Lead


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for the Tenant model."""
    
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'slug', 'created_at', 'updated_at']
        read_only_fields = ['slug', 'created_at', 'updated_at']


class LeadSerializer(serializers.ModelSerializer):
    """
    Serializer for the Lead model.
    Score is read-only as it's automatically calculated.
    """
    
    class Meta:
        model = Lead
        fields = [
            'id',
            'tenant',
            'first_name',
            'last_name',
            'email',
            'company',
            'budget',
            'company_size',
            'industry',
            'urgency',
            'score',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['score', 'created_at', 'updated_at']
    
    def validate_email(self, value):
        """Ensure email is lowercase."""
        return value.lower()


class LeadListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for lead list view.
    Shows only essential information for performance.
    """
    
    class Meta:
        model = Lead
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'company',
            'score',
            'created_at',
        ]
