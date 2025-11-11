from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TenantViewSet, LeadViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'leads', LeadViewSet, basename='lead')

urlpatterns = [
    path('', include(router.urls)),
]
