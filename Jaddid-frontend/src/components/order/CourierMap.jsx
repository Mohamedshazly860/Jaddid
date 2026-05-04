import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { Loader2 } from "lucide-react";

const courierIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const CourierMap = ({ order, trackingData, isArabic }) => {
  // Extract courier coordinates from order data
  const courierLat = trackingData?.latest_location?.latitude || order?.courier_details?.current_lat;
  const courierLng = trackingData?.latest_location?.longitude || order?.courier_details?.current_lng;
  
  // Extract customer coordinates from order delivery address or default
  const customerLat = order?.delivery_lat || 30.0444; // Cairo default
  const customerLng = order?.delivery_lng || 31.2357;

  // If courier coordinates are missing, show loading state
  if (!courierLat || !courierLng) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#708A58] w-12 h-12 mx-auto mb-2" />
          <p className="text-gray-600">{isArabic ? 'جاري تحميل الموقع...' : 'Loading location...'}</p>
        </div>
      </div>
    );
  }

  // Create polyline between courier and customer
  const positions = [
    [courierLat, courierLng],
    [customerLat, customerLng]
  ];

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border relative">
      <MapContainer
        center={[courierLat, courierLng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        key={`${courierLat}-${courierLng}`}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Courier Marker */}
        <Marker position={[courierLat, courierLng]} icon={courierIcon}>
          <Popup>
            <strong>{order?.courier_details?.name || (isArabic ? 'المندوب' : 'Courier')}</strong>
            <br />
            {isArabic ? 'الموقع الحالي' : 'Current Location'}
          </Popup>
        </Marker>

        {/* Customer Marker */}
        <Marker position={[customerLat, customerLng]} icon={customerIcon}>
          <Popup>
            <strong>{isArabic ? 'موقعك' : 'Your Location'}</strong>
            <br />
            {order?.delivery_address || (isArabic ? 'عنوان التوصيل' : 'Delivery Address')}
          </Popup>
        </Marker>

        {/* Route Line */}
        <Polyline 
          positions={positions} 
          color="#708A58" 
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      </MapContainer>
    </div>
  );
};

export default CourierMap;
