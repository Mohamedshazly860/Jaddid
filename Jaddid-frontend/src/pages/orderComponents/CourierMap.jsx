import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, MapPin, User, Clock, Map as MapIcon } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapResizer = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      if (center) map.panTo(center);
    }, 500);
  }, [map, center]);
  return null;
};

const CourierMap = ({ tracking, customerLat, customerLng, isArabic }) => {
  const [courierPosition, setCourierPosition] = useState(null);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    if (tracking?.latest_location) {
      const newPos = [
        tracking.latest_location.latitude,
        tracking.latest_location.longitude,
      ];
      setCourierPosition(newPos);
      setRoute((prev) => [...prev, newPos]);
    }
  }, [tracking]);

  if (!courierPosition || !customerLat || !customerLng) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center bg-gray-50 border-dashed border-2">
        <div className="text-center space-y-3">
          <Navigation className="w-10 h-10 text-blue-400 animate-pulse mx-auto" />
          <p className="text-gray-500 font-medium">
            {isArabic
              ? "في انتظار تحديد موقع السائق..."
              : "Waiting for courier location..."}
          </p>
        </div>
      </Card>
    );
  }

  const customerPosition = [customerLat, customerLng];
  const center = [
    (courierPosition[0] + customerPosition[0]) / 2,
    (courierPosition[1] + customerPosition[1]) / 2,
  ];

  return (
    <Card
      className="w-full overflow-hidden shadow-lg border-0"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <CardHeader className="bg-white border-b py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            {isArabic ? "تتبع السائق المباشر" : "Live Courier Tracking"}
          </CardTitle>
          {tracking?.latest_location?.distance_remaining && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
              {tracking.latest_location.distance_remaining.toFixed(2)} km
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 relative h-[450px] w-full bg-gray-100">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />

          {/* Courier Marker */}
          <Marker position={courierPosition} icon={courierIcon}>
            <Popup className="custom-popup">
              <div className="text-center p-1">
                <p className="font-bold border-b mb-1 pb-1">
                  {isArabic ? "السائق" : "Courier"}
                </p>
                {tracking?.latest_location?.estimated_time && (
                  <p className="text-xs text-blue-600 font-semibold">
                    ETA: {tracking.latest_location.estimated_time}{" "}
                    {isArabic ? "دقيقة" : "min"}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Customer Marker */}
          <Marker position={customerPosition} icon={customerIcon}>
            <Popup>
              <p className="font-bold">
                {isArabic ? "موقعك" : "Your Location"}
              </p>
            </Popup>
          </Marker>

          {/* Route History Line */}
          {route.length > 1 && (
            <Polyline
              positions={route}
              color="#3b82f6"
              weight={3}
              dashArray="5, 10"
              opacity={0.6}
            />
          )}

          {/* Direct Path Line (Anticipated Path) */}
          <Polyline
            positions={[courierPosition, customerPosition]}
            color="#10b981"
            weight={4}
            opacity={0.4}
          />

          <MapResizer center={center} />
        </MapContainer>

        {/* Floating Info Card (Uber Style Overlay) */}
        <div className="absolute bottom-6 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 leading-none mb-1 text-base">
                  {tracking?.courier_name || (isArabic ? "السائق" : "Courier")}
                </h4>
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Navigation className="w-3 h-3 rotate-45" />
                  {isArabic ? "في الطريق إليك" : "On the way to you"}
                </p>
              </div>
            </div>

            {tracking?.latest_location?.estimated_time && (
              <div className="text-center border-s ps-6">
                <div className="flex items-center gap-1 text-gray-400 mb-1 justify-center">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider font-bold">
                    ETA
                  </span>
                </div>
                <div className="flex items-baseline gap-1 justify-center">
                  <span className="text-2xl font-black text-gray-900">
                    {tracking.latest_location.estimated_time}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    {isArabic ? "دقيقة" : "min"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourierMap;
