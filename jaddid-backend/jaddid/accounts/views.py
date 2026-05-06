from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes,parser_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from accounts.admin import UserAdmin
from .models import User, Profile
from .serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,
    UserSerializer,
    UserRegisterationSerializer,
    UserProfileUpdateSerializer,
    ChangeOldPasswordSerializer,
    ProfileImageUploadSerializer,
    UserListSerializer,
)
from accounts import serializers
from .signals import user_logged_out
import redis
import json
import os

# Helper function to get Redis connection
def get_redis_connection():
    """Get Redis connection with fallback options"""
    try:
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            return redis.from_url(redis_url, decode_responses=True)
        else:
            redis_host = os.getenv("REDIS_HOST", "localhost")
            redis_port = int(os.getenv("REDIS_PORT", 6379))
            return redis.Redis(host=redis_host, port=redis_port, db=0, decode_responses=True)
    except Exception as e:
        print(f"Redis connection error: {e}")
        return None


# Helper function to get cached profile
def get_cached_profile(user_id):
    """Get user profile from Redis cache"""
    try:
        r = get_redis_connection()
        if not r:
            return None
        
        cache_key = f"user:{user_id}"
        cached_data = r.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        return None
    except Exception as e:
        print(f"Error retrieving cache: {e}")
        return None


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """for user registeration"""
    serializer=UserRegisterationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        user_data=UserSerializer(user).data

        return Response({
            'user':user_data,
            'tokens':{
                'refresh':str(refresh),
                'access':str(refresh.access_token)
            },
            'message':'Registration Successful'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """User Login function"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': 'both email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(email=email.lower(), password=password)
    if user is None:
        return Response({
            'error':'email or password is not valid'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.is_active:
        return Response({
            'error':'account is disabled, please contact support'
        }, status=status.HTTP_403_FORBIDDEN)
    
    refresh = RefreshToken.for_user(user)
    user_data = UserSerializer(user).data
    """
    profiledata = profile serializer(user.profile).data
    r = 
    """


    return Response({
        'user':user_data,
        'tokens':{
            'refresh':str(refresh),
            'access':str(refresh.access_token)
        },
        'message':'Login Successful!'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """User Logout"""
    try:
        user_id = request.user.id
        refresh_token=request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error':'refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        # Trigger signal to delete user profile from Redis cache
        user_logged_out.send(sender=request, user_id=user_id)

        return Response({
            'message':'Logout Successful'
        }, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({
            'error':'Invalid Token or Token already blacklisted'
        }, status=status.HTTP_400_BAD_REQUEST)
    

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """refresh access token"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh Token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)

        return Response({
            'access': str(token.access_token)
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error':'Invalid or expired token'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """get current user details - uses Redis cache for faster retrieval"""
    user = request.user
    
    try:
        user_id = str(user.id)
        
        # Try to get from Redis cache first
        cached_profile = get_cached_profile(user_id)
        if cached_profile:
            # Return cached data in the same format as the serializer
            return Response({
                'id': cached_profile['user_id'],
                'email': cached_profile['email'],
                'first_name': cached_profile['first_name'],
                'last_name': cached_profile['last_name'],
                'full_name': cached_profile['full_name'],
                'role': cached_profile['role'],
                'is_verified': cached_profile['is_verified'],
                'is_active': cached_profile['is_active'],
                'date_joined': cached_profile['date_joined'],
                'profile': {
                    'id': cached_profile.get('profile_id'),
                    'phone': cached_profile['phone'],
                    'address': cached_profile['address'],
                    'bio': cached_profile['bio'],
                    'profile_image': cached_profile['profile_image'],
                    'average_rating': cached_profile['average_rating'],
                    'review_count': cached_profile['review_count'],
                }
            }, status=status.HTTP_200_OK)
    except Exception as cache_err:
        print(f"Error getting cached profile: {cache_err}")
        # Continue to database if cache fails
    
    # If not in cache or cache error, fetch from database
    try:
        user_data = UserSerializer(user).data
        return Response(user_data, status=status.HTTP_200_OK)
    except Exception as db_err:
        print(f"Error serializing user: {db_err}")
        return Response({
            'error': 'Failed to load user data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_basic(request):
    """update basic info for user"""
    user = request.user
    partial = request.method == 'PATCH'

    serializer = UserProfileUpdateSerializer(user, data=request.data, partial=partial)

    if serializer.is_valid():
        serializer.save()
        user_data = UserSerializer(user).data
        return Response({
            'user': user_data,
            'message': 'User info updated successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Update User and Profile Together"""
    user = request.user
    partial = request.method == 'PATCH'
    # Use the combined UserProfileUpdateSerializer to update both user and profile
    serializer = UserProfileUpdateSerializer(user, data=request.data, partial=partial)

    if serializer.is_valid():
        serializer.save()

        user_data = UserSerializer(user).data

        return Response({
            'user': user_data,
            'message': 'Profile Updated Successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    """Delete User Account
    soft deletes user account by setting is_active = false"""

    user = request.user
    user.is_active = False
    user.save()

    return Response({
        'message':'account deleted successfully'
    }, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    queryset = User.objects.filter(is_active=True)

    #filter by role
    role = request.query_params.get('role', None)
    if role:
        queryset=queryset.filter(role=role)

    #search bt name or email
    search= request.query_params.get('search', None)
    if search:
        queryset = queryset.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )

    #Pagination
    paginator = PageNumberPagination()
    paginator.page_size = request.query_params.get('page_size', 20)
    result_page  = paginator.paginate_queryset(queryset, request)
    serializer = UserListSerializer(result_page, many=True)

    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])

def get_user_by_id(request, user_id):
    """get user by id (public profile)"""
    try:
        user = get_object_or_404(User, id=user_id)
        serializer=UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'error': 'User Does not exist or account deactivated'
        }, status=status.HTTP_404_NOT_FOUND)
    


#Profile CRUD


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get Current User Profile"""
    profile = request.user.profile
    # Return profile data using the ProfileSerializer
    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update Profile Info Only"""
    profile = request.user.profile
    partial = request.method == 'PATCH'

    # Update only the Profile model fields
    serializer = ProfileUpdateSerializer(profile, data=request.data, partial=partial)

    if serializer.is_valid():
        serializer.save()

        return Response({
            'profile': serializer.data,
            'message': 'profile updated successfully'
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_image(request):
    """upload profile Image"""
    profile = request.user.profile
    serializer = ProfileImageUploadSerializer(profile, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()

        image_url = None
        if profile.profile_image:
            image_url = request.build_absolute_uri(profile.profile_image.url)
        return Response({
            'profile_image': image_url,
            'message': 'Profile Image has been uploaded'
        }, status=status.HTTP_200_OK)
    
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_image(request):
    """Delete Profile Image"""
    profile = request.user.profile

    if profile.profile_image:
        profile.profile_image.delete()
        profile.save()

        return Response({
            'message': 'profile image has been deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
    
    return Response({
        'error': 'no profile image found'
    }, status=status.HTTP_400_BAD_REQUEST)


#Password Management

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = ChangeOldPasswordSerializer(data=request.data, context={'request':request})

    if serializer.is_valid():
        serializer.save()

        return Response({
            'message':'password changed successfully.'
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



#Utility Views

@api_view(['GET'])
@permission_classes([AllowAny])
def get_role_choices(request):
    """Get Available Role Choices for Registration"""
    #execlude admin for public choices
    choices=[
        {'value': choice[0], 'label': choice[1]}
        for choice in User.Role_Choices
        if choice[0] != User.Admin
    ]

    return Response({
        'roles': choices
    }, status=status.HTTP_200_OK)


# Temporary debug endpoint to verify CSRF behavior
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def debug_no_csrf(request):
    """Return OK to test whether CSRF is blocking POSTs."""
    return Response({'ok': True, 'method': request.method}, status=status.HTTP_200_OK)

