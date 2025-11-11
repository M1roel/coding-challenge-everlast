from django.utils.deprecation import MiddlewareMixin
from .models import Tenant


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to handle multi-tenancy.
    
    Reads the X-Tenant-ID header from the request and attaches the tenant
    object to the request for use in views.
    
    If no tenant ID is provided or the tenant doesn't exist, request.tenant
    will be None and views can handle accordingly.
    """
    
    def process_request(self, request):
        """
        Process incoming request to extract and validate tenant.
        """
        tenant_id = request.headers.get('X-Tenant-ID')
        
        if tenant_id:
            try:
                tenant = Tenant.objects.get(id=int(tenant_id))
                request.tenant = tenant
            except (Tenant.DoesNotExist, ValueError):
                request.tenant = None
        else:
            request.tenant = None
        
        return None
    
    def process_response(self, request, response):
        """
        Add tenant information to response headers for debugging.
        """
        if hasattr(request, 'tenant') and request.tenant:
            response['X-Tenant-Name'] = request.tenant.name
        
        return response
