from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('token/refresh/', views.refresh_token, name='token-refresh'),
    
    # Current User
    path('me/', views.get_current_user, name='user-detail'),
    path('me/update/', views.update_user_profile, name='user-update-all'),
    path('me/basic/', views.update_user_basic, name='user-update-basic'),
    path('me/delete/', views.delete_user, name='user-delete'),
    
    # User List & Detail
    path('users/', views.list_users, name='user-list'),
    path('users/<uuid:user_id>/', views.get_user_by_id, name='user-by-id'),
    
    # Profile
    path('profile/', views.get_profile, name='profile-detail'),
    path('profile/update/', views.update_profile, name='profile-update'),
    path('profile/image/', views.upload_profile_image, name='profile-image-upload'),
    path('profile/image/delete/', views.delete_profile_image, name='profile-image-delete'),
    
    # Password Management
    path('password/change/', views.change_password, name='password-change'),
    # path('password/reset/request/', views.request_password_reset, name='password-reset-request'),
    # path('password/reset/confirm/', views.reset_password, name='password-reset-confirm'),
    
    # Utilities
    path('roles/', views.get_role_choices, name='role-choices'),
    # path('verify-phone/', views.verify_phone, name='verify-phone'),
    # path('resend-verification/', views.resend_verification_code, name='resend-verification'),
]