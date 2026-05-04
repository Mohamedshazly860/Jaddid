from click import style
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Courier, CourierAssignment, LiveTracking

class CourierSerializer(serializers.ModelSerializer):
    full_name=serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model=Courier
        fields=[
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone',
            'transport_type',
            'vehicle_number',
            'current_lat',
            'current_lng',
            'is_active',
            'created_at'
        ]
    read_only_fields=['id', 'is_approved', 'is_verified', 'created_at']


class CourierRegistrationSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True, style={'input_type': 'password'})
    confirm_password=serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model=Courier
        fields=[
            'email',
            'password',
            'confirm_password',
            'first_name',
            'last_name',
            'phone',
            'transport_type',
            'vehicle_number',
            'current_lat',
            'current_lng'
        ]

    def validate_email(self, email):
        """check if email already exists"""
        if Courier.objects.filter(email=email.lower()).exists():
            raise serializers.ValidationError("A courier with this email already exists")
        return email.lower()
    
    def validate(self, attrs):
        """validate password confirmation"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_passwword": "passwords doesn't match"
            })
        #validate password strength
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        
        return attrs
    
    def create(self, validated_data):
        """create a courier with hashed password"""
        validated_data.pop('confirm_password')
        password=validated_data.pop('password')

        courier=Courier(**validated_data)
        courier.set_password(password)
        courier.save()

        return courier


class CourierUpdateSerializer(serializers.ModelSerializer):
    """update courier info"""
    class Meta:
        model=Courier
        fields=[
            'first_name',
            'last_name',
            'phone',
            'transport_type',
            'vehicle_number',
            'is_active'
        ]


class CourierLocationUpdateSerializer(serializers.Serializer):
    """for updating courier location"""
    latitude=serializers.FloatField(min_value=-90, max_value=90)
    longitude=serializers.FloatField(min_value=-180, max_value=180)


class CourierAssignmentSerializer(serializers.ModelSerializer):
    """serializer for courier assignment"""
    courier=CourierSerializer(read_only=True)
    order_id=serializers.UUIDField(source='order.id', read_only=True)

    class Meta:
        model=CourierAssignment
        fields=[
            'id',
            'order_id',
            'courier',
            'assigned_at',
            'accepted',
            'accepted_at',
            'completed_at',
            'rejected',
            'rejection_reason',
            'rejected_at'
        ]
        read_only_fields=['id', 'assigned_at']


class LiveTrackingSerializer(serializers.ModelSerializer):
    """serializer for live tracking"""
    courier_name=serializers.CharField(source='courier.get_full_name', read_only=True)
    
    class Meta:
        model=LiveTracking
        fields=[
            'id',
            'order',
            'courier',
            'courier_name',
            'latitude',
            'longitude',
            'distance_to_destination',
            'timestamp'
        ]
        read_only_fields=['id', 'timestamp']


