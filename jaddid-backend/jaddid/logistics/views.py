from xml.dom.expatbuilder import Rejecter
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from yaml import serialize
import threading
import time
import math 
from django.utils import timezone
from orders import serializers
from .models import Courier, CourierAssignment, LiveTracking
from .serializers import (
    CourierSerializer, CourierRegistrationSerializer, 
    CourierUpdateSerializer, CourierLocationUpdateSerializer, 
    CourierAssignmentSerializer,LiveTrackingSerializer
)
from .services import CourierService
from orders.models import Order
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.


#authentication


@swagger_auto_schema(methods=['POST'], request_body=CourierRegistrationSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def courier_register(request):
    """registeration function for couriers"""
    serializer = CourierRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        courier = serializer.save()

        refresh = RefreshToken.for_user(courier)
        refresh['courier_id']= str(courier.id)
        refresh['email']=courier.email
        refresh['user_type']='courier'

        courier_data = CourierSerializer(courier).data

        return Response({
            'courier':courier_data,
            'tokens':{
                'refresh':str(refresh),
                'access':str(refresh.access_token)
            },
            'message':'registration successful.'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(methods=['POST'], request_body=CourierSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def courier_login(request):
    email=request.data.get('email')
    password=request.data.get('password')

    if not email or not password:
        return Response({
            'error':'both email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        courier= Courier.objects.get(email=email)

        if not courier.check_password(password):
            return Response({
                'error':'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(courier)
        refresh['courier_id'] = str(courier.id)
        refresh['email'] = courier.email
        refresh['user_type'] = 'courier'

        courier_data=CourierSerializer(courier).data
        
        return Response({
            'courier': courier_data,
            'token':{
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            },
            'message': 'Login Successful. Welcome to Jaddid!'
        }, status=status.HTTP_200_OK)
    
    except Courier.DoesNotExist:
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    

#========================
#CRUD operations
#========================

# @swagger_auto_schema(methods=['GET'], request_body=CourierSerializer)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courier_profile(request):
    courier_id = request.auth.get('courier_id')
    if not courier_id:
        return Response({
            'error': 'Invalid Courier Token'
        }, status=status.HTTP_401_UNAUTHORIZED)

    try:
        courier=Courier.objects.get(id=courier_id)
        serializer=CourierSerializer(courier)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Courier.DoesNotExist:
        return Response({
            'error': 'Courier not found'
        }, status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(methods=['PUT', 'PATCH'], request_body=CourierUpdateSerializer)
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_courier_profile(request):
    courier_id = request.auth.get('courier_id')

    try:
        courier = Courier.objects.get(id=courier_id)
        partial = request.method == 'PATCH'

        serializer = CourierUpdateSerializer(courier, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            courier_data = CourierSerializer(courier).data

            return Response({
                'courier': courier_data,
                'message': 'Profile Updated successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
    except Courier.DoesNotExist:
        return Response({
            'error': 'courier not found'
        }, status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_courier_availability(request):
    courier_id=request.auth.get('courier_id')
    is_available=request.data.get('is_available')

    if is_available is None:
        return Response({
            'error': 'is_available field is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        courier = Courier.objects.get(id=courier_id)
        courier.is_available = is_available
        courier.save(update_fields=['is_available', 'updated_at'])

        return Response({
            'is_available': courier.is_available,
            'message': f"status changed to {'busy' if not is_available else 'available'}"
        }, status=status.HTTP_200_OK)

    except Courier.DoesNotExist:
        return Response({
            'error': 'courier not found'
        }, status=status.HTTP_404_NOT_FOUND)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_courier_location(request):
    courier_id = request.auth.get('courier_id')
    serializer = CourierLocationUpdateSerializer(data=request.data)

    if serializer.is_valid():
        try:
            courier = Courier.objects.get(id=courier_id)
            courier.current_lat = serializer.validated_data['latitude']
            courier.current_lng = serializer.validated_data['longitude']
            courier.save()

            return Response({
                'latitude': courier.current_lat,
                'longitude': courier.current_lng,
                'message': 'location updated successfully'
            }, status=status.HTTP_200_OK)


        except Courier.DoesNotExist:
            return Response({
                'error': 'Courier not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def assign_courier_to_order(request, order_id):
    """automatically assign nearest courier to order
    this is called automatically when order is created"""
    print("!!!VIEW ACCESSED!!!")
    try:
        order = Order.objects.get(pk=order_id)
        print(f"!!!FOUND ORDER: {order.order_id}!!!")
        #check if alrady assigned
        if hasattr(order, 'courier_assignment'):
            return Response({
                'error': 'courier already assigned to this order'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        #assign courier
        assignment = CourierService.assign_courier_to_order(order)

        if not assignment:
            return Response({
                'error': 'No available couriers found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CourierAssignmentSerializer(assignment)
        # AUTO-START SIMULATION
        if order.customer_lat and order.customer_lng:
            from .services import CourierService
            CourierService.simulate_delivery_route(assignment, order.customer_lat, order.customer_lng)

        return Response({
            'assignment': serializer.data,
            'message': 'courier assigned successfully'
        }, status=status.HTTP_201_CREATED)
    
    except Order.DoesNotExist:
        return Response({
            'error': 'Order Not Found'
        }, status=status.HTTP_404_NOT_FOUND)
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courier_assignments(request):
    """Get All Assignments for the current courier"""
    courier_id = request.auth.get('courier_id')
    status_filter = request.query_params.get('status', 'active')

    try:
        courier = Courier.objects.get(id=courier_id)
        assignments = CourierAssignment.objects.filter(courier=courier)
        if status_filter == 'active':
            assignments = assignments.filter(completed_at__isnull = True, rejected = False)
        elif status_filter == 'completed':
            assignments = assignments.filter(completed_at__isnull = False)

        serializer = CourierAssignmentSerializer(assignments, many=True)

        return Response({
            'count': assignments.count(),
            'assignments': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Courier.DoesNotExist:
        return Response({
            'error': 'Courier not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_delivery(request, assignment_id):
    print(f"!!! STARTING DELIVERY FOR ASSIGNMENT: {assignment_id} !!!")
    try:
        # 1. Use pk=assignment_id to be safe with UUIDs
        assignment = CourierAssignment.objects.get(pk=assignment_id)
        
        # 2. Extract destination coordinates from the order
        # Ensure these field names match your Order model (customer_lat/lng)
        dest_lat = getattr(assignment.order, 'customer_lat', None)
        dest_lng = getattr(assignment.order, 'customer_lng', None)

        if dest_lat is None or dest_lng is None:
            return Response({"error": "Order is missing destination coordinates"}, status=400)

        # 3. Trigger the simulation
        CourierService.simulate_delivery_route(assignment, dest_lat, dest_lng)

        return Response({
            "message": "Delivery simulation started successfully",
            "assignment_id": assignment_id
        }, status=status.HTTP_200_OK)

    except CourierAssignment.DoesNotExist:
        return Response({"error": "Assignment not found"}, status=404)
    except Exception as e:
        print(f"!!! START_DELIVERY CRASH: {str(e)} !!!")
        return Response({"error": str(e)}, status=500)
#=======================
#Live Tracking
#=======================

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points in km"""
    if not all([lat1, lon1, lat2, lon2]):
        return None
    R = 6371  # Earth radius in kilometers
    d_lat = math.radians(float(lat2) - float(lat1))
    d_lon = math.radians(float(lon2) - float(lon1))
    a = (math.sin(d_lat / 2) * math.sin(d_lat / 2) +
         math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) *
         math.sin(d_lon / 2) * math.sin(d_lon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_tracking(request, order_id):
    """Get live tracking data for an order"""
    try:
        order = Order.objects.get(order_id=order_id)

        # check if requester is the buyer of this order
        if order.buyer != request.user:
            return Response({
                'error': "you don't have permession to review this order"
            }, status=status.HTTP_403_FORBIDDEN)
        
        tracking_logs = LiveTracking.objects.filter(order=order).order_by('-timestamp')
        serializer = LiveTrackingSerializer(tracking_logs, many=True)

        #get latest location
        latest = tracking_logs.first()

        if not latest:
            try:
                assignment = CourierAssignment.objects.get(order=order)
                courier = assignment.courier
                
                # Calculate distance between courier and customer manually for the fallback
                dist = calculate_haversine_distance(
                    courier.current_lat, courier.current_lng,
                    order.customer_lat, order.customer_lng
                )
                
                return Response({
                    'order_id': str(order.pk),
                    'status': order.order_status,
                    'tracking_logs': [],
                    'latest_location': {
                        'latitude': courier.current_lat,
                        'longitude': courier.current_lng,
                        'distance_remaining': round(dist, 2) if dist else None, # FIX: No longer null
                        'timestamp': timezone.now()
                    }
                }, status=status.HTTP_200_OK)
            except CourierAssignment.DoesNotExist:
                return Response({'error': 'No courier assigned'}, status=404)

        # Normal response when simulation is running
        serializer = LiveTrackingSerializer(tracking_logs, many=True)
        return Response({
            'order_id': str(order.pk),
            'status': order.order_status,
            'tracking_logs': serializer.data,
            'latest_location': {
                'latitude': latest.latitude,
                'longitude': latest.longitude,
                'distance_remaining': round(latest.distance_to_destination, 2) if latest.distance_to_destination else 0,
                'timestamp': latest.timestamp
            }
        }, status=status.HTTP_200_OK)
    
    except Order.DoesNotExist:
        return Response({'error': 'order not found'}, status=404)
    


@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_couriers(request):
    """Get list of available couriers (for admin/testing)"""
    couriers = Courier.objects.filter(
        is_available=True
    )

    serializer = CourierSerializer(couriers, many=True)

    return Response({
        'count': couriers.count(),
        'couriers': serializer.data
    }, status=status.HTTP_200_OK)
