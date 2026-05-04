// src/pages/OrderTrackingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  User,
  Phone,
  ArrowLeft,
  PartyPopper,
  Navigation,
} from "lucide-react";
import ordersService from "@/services/ordersService";
import { useToast } from "@/hooks/use-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const courierIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%2316a34a'%3E%3Cpath d='M18 18.5a1.5 1.5 0 0 1-1 1.4V21a1 1 0 0 1-2 0v-1H9v1a1 1 0 0 1-2 0v-1.1a1.5 1.5 0 0 1-1-1.4v-2a6 6 0 0 1 1-3.3V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6.2a6 6 0 0 1 1 3.3v2zM9 6h6v3H9V6zm9 10.5V15a4 4 0 0 0-8 0v1.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5z'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const destinationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23dc2626'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const isArabic = language === "ar";

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulationTriggered, setIsSimulationTriggered] = useState(false);

  const statusSteps = [
    {
      key: "pending",
      label: isArabic ? "قيد الانتظار" : "Pending",
      icon: Clock,
    },
    {
      key: "confirmed",
      label: isArabic ? "تم التأكيد" : "Confirmed",
      icon: CheckCircle2,
    },
    {
      key: "courier_assigned",
      label: isArabic ? "تم تعيين السائق" : "Courier Assigned",
      icon: User,
    },
    {
      key: "in_progress",
      label: isArabic ? "في الطريق" : "In Progress",
      icon: Truck,
    },
    {
      key: "delivered",
      label: isArabic ? "تم التوصيل" : "Delivered",
      icon: Package,
    },
  ];

  const fetchOrderData = async () => {
    try {
      const [orderResponse, trackingResponse] = await Promise.all([
        ordersService.getOrder(orderId),
        ordersService.getTracking(orderId),
      ]);

      console.log("Order data:", orderResponse.data);
      console.log("Tracking data:", trackingResponse.data);

      setOrder(orderResponse.data);
      setTracking(trackingResponse.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch order data:", err);
      setError(err.response?.data?.error || "Failed to load order");
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "فشل تحميل بيانات الطلب"
          : "Failed to load order data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  useEffect(() => {
    const triggerSimulation = async () => {
      if (
        order &&
        order.order_status === "in_progress" &&
        order.assignment_id &&
        !isSimulationTriggered &&
        (!tracking?.tracking_logs || tracking.tracking_logs.length === 0)
      ) {
        try {
          setIsSimulationTriggered(true);
          console.log(
            "Triggering delivery simulation for assignment:",
            order.assignment_id
          );

          await ordersService.startDelivery(order.assignment_id);
          fetchOrderData();
        } catch (err) {
          console.error("Failed to auto-start delivery simulation:", err);
          setIsSimulationTriggered(false);
        }
      }
    };

    triggerSimulation();
  }, [
    order?.order_status,
    order?.assignment_id,
    tracking?.tracking_logs?.length,
  ]);

  useEffect(() => {
    if (
      !order ||
      order.order_status === "delivered" ||
      order.order_status === "completed"
    ) {
      return;
    }

    const interval = setInterval(() => {
      fetchOrderData();
    }, 5000);

    return () => clearInterval(interval);
  }, [order?.order_status]);

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const status = order.order_status?.toLowerCase();

    const statusMap = {
      pending: 0,
      confirmed: 1,
      courier_assigned: 2,
      in_progress: 3,
      on_the_way: 3,
      delivered: 4,
      completed: 4,
    };

    return statusMap[status] !== undefined ? statusMap[status] : -1;
  };

  const isStepCompleted = (stepIndex) => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex >= stepIndex;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString(isArabic ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCourierInfo = () => {
    if (!order) return null;

    if (order.courier_assigned && order.courier_name) {
      return {
        name: order.courier_name,
        transport_type: order.transport_type || null,
      };
    }

    return null;
  };

  const getCourierLocation = () => {
    if (!tracking?.latest_location) return null;

    return {
      lat: tracking.latest_location.latitude,
      lng: tracking.latest_location.longitude,
    };
  };

  // Get customer/destination location
  const getDestinationLocation = () => {
    if (!order?.customer_lat || !order?.customer_lng) return null;

    return {
      lat: order.customer_lat,
      lng: order.customer_lng,
    };
  };

  const shouldShowMap = () => {
    const activeStatuses = ["in_progress", "on_the_way"];
    return order && activeStatuses.includes(order.order_status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isArabic ? "جاري تحميل بيانات الطلب..." : "Loading order data..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isArabic ? "الطلب غير موجود" : "Order Not Found"}
            </h2>
            <p className="text-gray-600 mb-4">
              {isArabic
                ? "لم نتمكن من العثور على هذا الطلب"
                : "We couldn't find this order"}
            </p>
            <Button onClick={() => navigate("/orders")}>
              {isArabic ? "العودة إلى الطلبات" : "Back to Orders"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDelivered =
    order.order_status === "delivered" || order.order_status === "completed";
  const courierInfo = getCourierInfo();
  const courierLocation = getCourierLocation();
  const destinationLocation = getDestinationLocation();

  return (
    <div className="min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="mb-4"
          >
            <ArrowLeft
              className={`w-4 h-4 ${isArabic ? "ml-2 rotate-180" : "mr-2"}`}
            />
            {isArabic ? "العودة إلى الطلبات" : "Back to Orders"}
          </Button>
          <h1 className="text-3xl font-bold">
            {isArabic ? "تتبع الطلب" : "Order Tracking"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isArabic ? "رقم الطلب:" : "Order ID:"} {order.order_id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Order Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className={isArabic ? "font-arabic" : ""}>
                  {isArabic ? "تفاصيل الطلب" : "Order Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  {/* Items Detail Section */}
                  <div className="flex flex-col gap-2 py-3 border-b border-gray-100">
                    <div className="flex items-start gap-2 text-gray-500 mb-1">
                      <span className="text-sm font-medium">
                        {isArabic ? "الأصناف المطلوبة" : "Ordered Items"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items &&
                        order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start bg-gray-50 p-2 rounded-md"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">
                                {/* Display product title if available, otherwise material name  */}
                                {item.product_title || item.material_name}
                              </span>
                              <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">
                                {/* Determine type based on which field has data  */}
                                {item.product_title
                                  ? isArabic
                                    ? "منتج"
                                    : "Product"
                                  : isArabic
                                  ? "خامة"
                                  : "Material"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              x{item.quantity}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {isArabic ? "عنوان التوصيل" : "Delivery Address"}
                    </p>
                    <p className="font-semibold text-sm">
                      {order.delivery_address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {isArabic ? "تاريخ الطلب" : "Order Date"}
                    </p>
                    <p className="font-semibold text-sm">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {isArabic ? "الإجمالي" : "Total"}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ${order.total_price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">
                      {isArabic ? "حالة الدفع" : "Payment Status"}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        order.payment_status === "paid"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {order.payment_status === "paid"
                        ? isArabic
                          ? "تم الدفع"
                          : "Paid"
                        : isArabic
                        ? "قيد الانتظار"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courier Info Card */}
            {courierInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className={isArabic ? "font-arabic" : ""}>
                    {isArabic ? "معلومات السائق" : "Courier Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {courierInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {courierInfo.name}
                      </p>
                      {courierInfo.transport_type && (
                        <div className="flex items-center gap-2 mt-1">
                          <Truck className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600 capitalize">
                            {/* Replaces underscores with spaces, e.g., 'motor_cycle' -> 'motor cycle' */}
                            {courierInfo.transport_type.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Map or Progress Tracking or Delivered State */}
          <div className="lg:col-span-2">
            {isDelivered ? (
              /* Delivered State */
              <Card className="h-full border-2 border-green-500">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <PartyPopper className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">
                    {isArabic ? "تم التوصيل بنجاح!" : "Successfully Delivered!"}
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    {isArabic
                      ? "تم توصيل طلبك بنجاح"
                      : "Your order has been delivered successfully"}
                  </p>

                  {order.delivered_at && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-8">
                      <p className="text-sm text-gray-600 mb-1">
                        {isArabic ? "تاريخ التوصيل" : "Delivered On"}
                      </p>
                      <p className="font-semibold">
                        {formatDate(order.delivered_at)}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      onClick={() => navigate("/orders")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isArabic ? "عرض جميع الطلبات" : "View All Orders"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/marketplace")}
                    >
                      {isArabic ? "متابعة التسوق" : "Continue Shopping"}
                    </Button>
                  </div>

                  <div className="mt-8 flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : shouldShowMap() && courierLocation && destinationLocation ? (
              /* Live Map View */
              <Card className="h-full">
                <CardHeader>
                  <CardTitle
                    className={`flex items-center gap-2 ${
                      isArabic ? "font-arabic" : ""
                    }`}
                  >
                    <Navigation className="w-5 h-5 text-green-600" />
                    {isArabic ? "تتبع مباشر" : "Live Tracking"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="rounded-lg overflow-hidden border-2 border-gray-200 relative"
                    style={{ height: "500px", zIndex: 0 }}
                  >
                    <MapContainer
                      center={[courierLocation.lat, courierLocation.lng]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      key={`${courierLocation.lat}-${courierLocation.lng}`}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* Courier Marker */}
                      <Marker
                        position={[courierLocation.lat, courierLocation.lng]}
                        icon={courierIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">
                              {isArabic ? "السائق" : "Courier"}
                            </p>
                            <p className="text-sm">
                              {courierInfo?.name || "Courier"}
                            </p>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Destination Marker */}
                      <Marker
                        position={[
                          destinationLocation.lat,
                          destinationLocation.lng,
                        ]}
                        icon={destinationIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">
                              {isArabic ? "وجهتك" : "Your Location"}
                            </p>
                            <p className="text-sm">{order.delivery_address}</p>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Line between courier and destination */}
                      <Polyline
                        positions={[
                          [courierLocation.lat, courierLocation.lng],
                          [destinationLocation.lat, destinationLocation.lng],
                        ]}
                        color="#16a34a"
                        weight={3}
                        opacity={0.6}
                        dashArray="10, 10"
                      />
                    </MapContainer>
                  </div>

                  {/* Map Info Banner */}
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            {isArabic
                              ? "السائق في الطريق إليك"
                              : "Courier is on the way"}
                          </p>
                          <p className="text-xs text-green-700">
                            {isArabic
                              ? "يتم التحديث كل 5 ثواني"
                              : "Updates every 5 seconds"}
                          </p>
                        </div>
                      </div>
                      {tracking?.latest_location?.distance_remaining && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-900">
                            {tracking.latest_location.distance_remaining.toFixed(
                              2
                            )}{" "}
                            km
                          </p>
                          <p className="text-xs text-green-700">
                            {isArabic ? "متبقي" : "remaining"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Steps - Compact Version */}
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold text-sm text-gray-700">
                      {isArabic ? "مراحل التوصيل" : "Delivery Progress"}
                    </h4>
                    <div className="flex items-center justify-between">
                      {statusSteps.map((step, index) => {
                        const Icon = step.icon;
                        const completed = isStepCompleted(index);
                        const isCurrent = getCurrentStepIndex() === index;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-col items-center flex-1"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                completed
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-400"
                              } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <p
                              className={`mt-2 text-xs text-center ${
                                completed
                                  ? "text-gray-900 font-medium"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                            {index < statusSteps.length - 1 && (
                              <div
                                className={`absolute w-full h-0.5 top-5 left-1/2 ${
                                  completed ? "bg-green-600" : "bg-gray-300"
                                }`}
                                style={{
                                  width: "calc(100% - 40px)",
                                  transform: "translateX(20px)",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Progress Tracking (fallback when map shouldn't show) */
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className={isArabic ? "font-arabic" : ""}>
                    {isArabic ? "حالة الطلب" : "Order Status"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const completed = isStepCompleted(index);
                      const isCurrent = getCurrentStepIndex() === index;

                      return (
                        <div
                          key={step.key}
                          className="relative flex items-start gap-4"
                        >
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`absolute ${
                                isArabic ? "right-6" : "left-6"
                              } top-12 w-0.5 h-16 ${
                                completed ? "bg-green-600" : "bg-gray-300"
                              }`}
                            />
                          )}

                          <div
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                              completed
                                ? "bg-green-600 text-white shadow-lg"
                                : "bg-gray-200 text-gray-400"
                            } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 pt-2">
                            <h3
                              className={`font-semibold text-lg ${
                                completed ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </h3>
                            {completed && (
                              <p className="text-sm text-gray-600 mt-1">
                                {isCurrent
                                  ? isArabic
                                    ? "جاري التنفيذ"
                                    : "In Progress"
                                  : isArabic
                                  ? "مكتمل"
                                  : "Completed"}
                              </p>
                            )}
                          </div>

                          {completed && !isCurrent && (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tracking Logs */}
                  {tracking &&
                    tracking.tracking_logs &&
                    tracking.tracking_logs.length > 0 && (
                      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-3">
                          {isArabic ? "سجل التتبع" : "Tracking History"}
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {tracking.tracking_logs.map((log, index) => (
                            <div
                              key={index}
                              className="text-sm text-gray-600 flex justify-between items-center"
                            >
                              <span>
                                {isArabic ? "الموقع:" : "Location:"}{" "}
                                {log.latitude.toFixed(4)},{" "}
                                {log.longitude.toFixed(4)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Live Updates Indicator */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      <p className="text-sm text-blue-900 font-medium">
                        {isArabic
                          ? "يتم التحديث التلقائي كل 5 ثواني"
                          : "Auto-updating every 5 seconds"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
