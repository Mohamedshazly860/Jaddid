from typing import Required
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password as django_validate_password, validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .models import User, Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=Profile
        fields=[
            'id',
            'phone',
            'address',
            'bio',
            'profile_image',
            'average_rating',
            'review_count',
            'push_token',
            'created_at',
            'updated_at'
        ]
        read_only_fields=['id', 'created_at', 'updated_at', 'review_count', 'average_rating']

        extra_kwargs = {
            'profile_image': {'read_only': True}
        }

class UserSerializer(serializers.ModelSerializer):
    """Serializers for GET requests only"""
    profile=ProfileSerializer(read_only=True)
    full_name=serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model=User
        fields=[
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'is_verified',
            'is_active',
            'date_joined',
            'profile'
        ]
        read_only_fields = [
            'id',
            'is_verified',
            'is_active',
            'date_joined'
        ]

class UserRegisterationSerializer(serializers.ModelSerializer):
    """For user registeration"""
    password=serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    confirm_password=serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model=User
        fields=[
            'email',
            'password',
            'confirm_password',
            'first_name',
            'last_name',
            'role',
        ]
        extra_kwargs={
            'first_name': {'required': True},
            'last_name' : {'required': True}
        }

    def validate_role(self,value):
        """Prevents the user to register as an admin"""
        if value == User.Admin:
            raise serializers.ValidationError(
            "Cannot register as admin. Please contact support."
            )
        return value
    
    def validate_email(self, value):
        """Basic email validation and uniqueness check"""
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError(
                "A user with this email already exists"
            )
        return value.lower()
    
    # def validate_password(self,attrs):
    #     """validates passwords match and strength"""
    #     if attrs['password'] != attrs['confirm_password']:
    #         raise serializers.ValidationError({
    #         "confirm_password": "Passwords do not match."
    #         }
    #         )
        
    #     try:
    #         validate_password(attrs['password'])
    #     except ValidationError as e:
    #         raise serializers.ValidationError({
    #             "password": list(e.messages)
    #         })
        
    #     return attrs

    def validate_password(self, value):
        """Simple password validator: minimum length 8 chars."""
        if not isinstance(value, str) or len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )

        return value

    # 2. Global validator for cross-field matching
    def validate(self, attrs):
        """validates that passwords match"""
        # Check for matching passwords
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        # Extra simple checks: ensure password doesn't contain parts of email or name
        password_lower = attrs['password'].lower()
        email = attrs.get('email', '')
        if email:
            local_part = email.split('@')[0].lower()
            if local_part and local_part in password_lower:
                raise serializers.ValidationError({
                    "password": "Password must not contain part of the email address."
                })

        first_name = attrs.get('first_name', '')
        if first_name and first_name.lower() in password_lower:
            raise serializers.ValidationError({
                "password": "Password must not contain your first name."
            })

        last_name = attrs.get('last_name', '')
        if last_name and last_name.lower() in password_lower:
            raise serializers.ValidationError({
                "password": "Password must not contain your last name."
            })

        return attrs
    
    def create(self, validated_data):
        """Create user with encrypted password"""
        validated_data.pop('confirm_password')
        user=User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', User.Individual)
        )

        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
        """
        Combined serializer for updating both User and Profile in one request
        Useful when user wants to update everything at once from one form
        """
        profile=ProfileSerializer(required=False)

        class Meta:
            model=User
            profile=User
            fields=[
                'first_name',
                'last_name',
                'profile'
            ]
            
        def update(self, instance, validated_data):
            """update user info and profile together"""
            profile_data=validated_data.pop('profile', None)

            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            # Update profile if data provided
            if profile_data and hasattr(instance, 'profile'):
                profile = instance.profile
                for attr, value in profile_data.items():
                    setattr(profile, attr, value)
                profile.save()
        
            return instance

class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating profile information only"""
    
    class Meta:
        model = Profile
        fields = [
            'phone',
            'address',
            'bio',
            'profile_image',
            'push_token'
        ]
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and len(value) < 10:
            raise serializers.ValidationError(
                "Phone number must be at least 10 digits."
            )
        return value

class ChangeOldPasswordSerializer(serializers.Serializer):
        """serialzer for changing password"""
        old_password=serializers.CharField(
            required=True,
            write_only=True,
            style={'input_type': 'password'}
        )
        new_password = serializers.CharField(
            required=True,
            write_only=True,
            style={'input_type': 'password'}
        )
        new_password_confirm = serializers.CharField(required=True,
            write_only=True,
            style={'input_type': 'password'}
        )

        def validate_old_password(self, value):
            """Check if old password is correct"""
            user = self.context['request'].user
            if not user.check_password(value):
                raise serializers.ValidationError("Old password is incorrect.")
            return value
        
        def validate(self, attrs):
            """Validate new password confirmation"""
            if attrs['new_password'] != attrs['new_password_confirm']:
                raise serializers.ValidationError({
                    "new_password_confirm": "New passwords do not match."
                })
            
            # Validate password strength
            try:
                validate_password(attrs['new_password'])
            except ValidationError as e:
                raise serializers.ValidationError({
                    "new_password": list(e.messages)
                })
            
            return attrs
        

        def save(self):
            """Set new password"""
            user = self.context['request'].user
            user.set_password(self.validated_data['new_password'])
            user.save()
            return user

class RoleChoicesSerializer(serializers.ModelSerializer):
    """Serializer to return available role choices"""
    
    value = serializers.CharField()
    label = serializers.CharField()

class ProfileImageUploadSerializer(serializers.ModelSerializer):
    """Serializer for profile image upload"""
    
    class Meta:
        model = Profile
        fields = ['profile_image']
    
    def validate_profile_image(self, value):
        """Validate image size and format"""
        # Check file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Image file size cannot exceed 5MB."
            )
        
        # Check file format
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"File format not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        return value

class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user lists"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    profile_image = serializers.ImageField(source='profile.profile_image', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'is_verified',
            'profile_image'
        ]