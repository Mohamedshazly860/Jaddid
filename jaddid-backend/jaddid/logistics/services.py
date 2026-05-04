import math
from multiprocessing import Value
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q
from .models import Courier, CourierAssignment, LiveTracking
from orders.models import Order
import threading
import time


class CourierService:
    """Service class for courier-related operations"""

    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """calculate distance between two points using Haversine formula
        returns distance in kilometers"""
        
        R=6371 #Earth Radius in kilometers

        lat1_rad=math.radians(lat1)
        lat2_rad=math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        a = (math.sin(delta_lat / 2) ** 2 +
                    math.cos(lat1_rad) * math.cos(lat2_rad) *
                    math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                
        distance = R * c
        return distance
    
    @staticmethod
    def find_nearest_courier(order_lat, order_lng):
        """Find the nearest available courier
        Returns: Courier Object or None"""
        available_couriers=Courier.objects.filter(
            is_active=True,
            current_lat__isnull=False,
            current_lng__isnull=False
        )

        if not available_couriers.exists():
            return None
        
        #calculate the distance and find the nearest
        nearest_courier=None
        min_distance=float('inf')

        for courier in available_couriers:
            try:
                distance=CourierService.calculate_distance(
                float(courier.current_lat),
                float(courier.current_lng),
                float(order_lat),
                float(order_lng)
            )

                if distance < min_distance:
                    min_distance=distance
                    nearest_courier=courier
            except (TypeError, ValueError) as e:
                print(f"DEBUG: Distance Calculator error for courier {courier.id}: {e}")
            
        
        return nearest_courier
    

    @staticmethod
    def assign_courier_to_order(order):
        """Automatically assign nearest available courier to order
        Returns: CourierAssignment or None"""
        customer_lat = getattr(order, 'customer_lat', 30.0444)
        customer_lng = getattr(order, 'customer_lng', 31.2357)

        #find the nearest courier
        courier=CourierService.find_nearest_courier(customer_lat, customer_lng)

        
        if not courier:
            print(f"DEBUG: No courier found for Order {order.order_id}")
            return None
        
        print(f"DEBUG: Found courier {courier.email} for Order {order.order_id}")
        
        try:
        # 3. Use update_or_create to prevent "IntegrityError" (OneToOne duplicate)
            assignment, created = CourierAssignment.objects.update_or_create(
                order=order,
                defaults={
                    'courier': courier,
                    'accepted': True,
                    'accepted_at': timezone.now()
                }
            )

            # 4. Update order status (Matches your 'order_status' field)
            order.order_status = 'in_progress'
            order.save()
            
            print(f"DEBUG: Assignment {'created' if created else 'updated'} successfully")
            return assignment

        except Exception as e:
            print(f"DEBUG: Failed to create assignment: {str(e)}")
            return None
        

    @staticmethod
    def simulate_delivery_route(assignment, destination_lat, destination_lng):
        """Simulate courier movement from current location to destination
        Creates tracking logs along the route"""
        courier=assignment.courier
        order = assignment.order

        def run_simulation():
            try:
                order.order_status = 'on_the_way'
                order.save()

                start_lat = float(courier.current_lat)
                start_lng = float(courier.current_lng)
                dest_lat = float(destination_lat)
                dest_lng = float(destination_lng)

                steps = 20
                lat_increment = (dest_lat - start_lat) / steps
                lng_increment = (dest_lng - start_lng) / steps

                for step in range(1, steps + 1):
                    time.sleep(5)
                    current_lat = start_lat + (lat_increment * step)
                    current_lng = start_lng + (lng_increment * step)

                    distance = CourierService.calculate_distance(
                        current_lat, current_lng, dest_lat, dest_lng
                    )

                    LiveTracking.objects.create(
                        order=order,
                        courier=courier,
                        latitude=current_lat,
                        longitude=current_lng,
                        distance_to_destination=round(distance, 2)
                    )

                    courier.current_lat = current_lat
                    courier.current_lng = current_lng
                    courier.save()

                    print(f"DEBUG: Order {order.order_id} step {step}/{steps} - Dist: {distance:.2f}KM")

                order.order_status = 'delivered'
                order.delivered_at = timezone.now()
                order.save()

                assignment.completed_at = timezone.now()
                assignment.save()

                courier.is_active = True
                courier.save()

                print(f"DEBUG: order {order.order_id} Delivered Successfully!!!!")
            except Exception as e:
                print(f"ERROR IN THE SIMULATION {str(e)}")
            
        simulation_thread = threading.Thread(target=run_simulation) 
        simulation_thread.start()

        return True
            
