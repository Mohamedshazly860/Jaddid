"""
URL configuration for jaddid project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from django.urls import path


# Swagger/OpenAPI Schema


schema_view = get_schema_view(
   openapi.Info(
      title="Jaddid Marketplace API",
      default_version='v1',
      description="API documentation for Jaddid Recyclable Materials Marketplace",
      terms_of_service="https://www.jaddid.com/terms/",
      contact=openapi.Contact(email="contact@jaddid.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
   
)
# ====================
# Push Notification VAPID Key View
# ====================
def vapid_public_key(request):
    """
    Returns the VAPID public key for push notifications.
    """
    vapid_key = getattr(settings, 'VAPID_PUBLIC_KEY', None)
    
    if not vapid_key:
        return JsonResponse({
            'error': 'VAPID public key not configured'
        }, status=500)
    
    return JsonResponse({
        'public_key': vapid_key
    })


    
urlpatterns = [
    path('admin/', admin.site.urls),

    #Accounts URLs
    path('api/accounts/', include('accounts.urls')),
    
    # JWT Authentication
    path('api/auth/jwt/create/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/marketplace/', include('marketplace.urls')),

    #Logistics URLs
    path('api/logistics/', include('logistics.urls')),
    
    #Community URLs
    path('api/community/', include('community.urls')),
    
    # Push Notifications
    path('api/push/vapid-public-key/', vapid_public_key, name='vapid_public_key'),
    
    #Orders urls
    path('api/orders/', include('orders.urls')),
    

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

# Media files handling in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

