from django.contrib import admin
from .models import Tenant, Lead


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    """Admin interface for Tenant model."""
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name', 'slug']
    readonly_fields = ['created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Admin interface for Lead model."""
    list_display = [
        'first_name',
        'last_name',
        'company',
        'email',
        'score',
        'industry',
        'urgency',
        'tenant',
        'created_at',
    ]
    list_filter = ['industry', 'urgency', 'tenant', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'company']
    readonly_fields = ['score', 'created_at', 'updated_at']
    ordering = ['-score', '-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant', 'first_name', 'last_name', 'email', 'company')
        }),
        ('Scoring Criteria', {
            'fields': ('budget', 'company_size', 'industry', 'urgency')
        }),
        ('Calculated Score', {
            'fields': ('score',),
            'description': 'Score is automatically calculated based on the criteria above.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
