from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Tenant, Lead
from .serializers import TenantSerializer, LeadSerializer, LeadListSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tenants.
    
    Provides CRUD operations for tenants.
    """
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    
    def get_queryset(self):
        """Optionally filter by name."""
        queryset = Tenant.objects.all()
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset


class LeadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leads.
    
    Automatically filters leads by tenant if X-Tenant-ID header is present.
    Provides additional endpoints for top leads.
    """
    queryset = Lead.objects.all()
    
    def get_serializer_class(self):
        """Use simplified serializer for list view."""
        if self.action == 'list':
            return LeadListSerializer
        return LeadSerializer
    
    def get_queryset(self):
        """
        Filter leads by tenant if tenant is set in request.
        Also supports search and filtering.
        """
        queryset = Lead.objects.all()
        
        # Tenant filtering (set by middleware)
        if hasattr(self.request, 'tenant') and self.request.tenant:
            queryset = queryset.filter(tenant=self.request.tenant)
        
        # Search by name, email, or company
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(company__icontains=search)
            )
        
        # Filter by industry
        industry = self.request.query_params.get('industry', None)
        if industry:
            queryset = queryset.filter(industry=industry)
        
        # Filter by urgency
        urgency = self.request.query_params.get('urgency', None)
        if urgency:
            queryset = queryset.filter(urgency=urgency)
        
        # Filter by minimum score
        min_score = self.request.query_params.get('min_score', None)
        if min_score:
            try:
                queryset = queryset.filter(score__gte=int(min_score))
            except ValueError:
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Set tenant from request if not provided.
        """
        tenant = serializer.validated_data.get('tenant')
        if not tenant and hasattr(self.request, 'tenant') and self.request.tenant:
            serializer.save(tenant=self.request.tenant)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def top(self, request):
        """
        Get top leads by score.
        
        Query params:
        - limit: Number of leads to return (default: 10)
        """
        limit = int(request.query_params.get('limit', 10))
        queryset = self.get_queryset()[:limit]
        serializer = LeadListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics about leads.
        
        Returns:
        - total_leads: Total number of leads
        - avg_score: Average score
        - high_score_leads: Leads with score >= 70
        """
        queryset = self.get_queryset()
        total = queryset.count()
        
        if total == 0:
            return Response({
                'total_leads': 0,
                'avg_score': 0,
                'high_score_leads': 0,
            })
        
        # Calculate average score
        from django.db.models import Avg
        avg_score = queryset.aggregate(Avg('score'))['score__avg']
        
        # Count high score leads
        high_score_count = queryset.filter(score__gte=70).count()
        
        return Response({
            'total_leads': total,
            'avg_score': round(avg_score, 2) if avg_score else 0,
            'high_score_leads': high_score_count,
        })
