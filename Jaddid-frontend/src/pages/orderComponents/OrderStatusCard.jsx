import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";

const OrderStatusCard = ({ order, isArabic }) => {
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        icon: Clock,
        color: "text-yellow-600 bg-yellow-50",
        label: isArabic ? "في انتظار التأكيد" : "Pending Confirmation",
      },
      CONFIRMED: {
        icon: CheckCircle,
        color: "text-blue-600 bg-blue-50",
        label: isArabic ? "تم التأكيد" : "Confirmed",
      },
      IN_PROGRESS: {
        icon: Package,
        color: "text-purple-600 bg-purple-50",
        label: isArabic ? "قيد التجهيز" : "In Progress",
      },
      COURIER_ASSIGNED: {
        icon: Truck,
        color: "text-indigo-600 bg-indigo-50",
        label: isArabic ? "تم تعيين السائق" : "Courier Assigned",
      },
      ON_THE_WAY: {
        icon: Truck,
        color: "text-orange-600 bg-orange-50",
        label: isArabic ? "في الطريق" : "On the Way",
      },
      DELIVERED: {
        icon: CheckCircle,
        color: "text-green-600 bg-green-50",
        label: isArabic ? "تم التوصيل" : "Delivered",
      },
      COMPLETED: {
        icon: CheckCircle,
        color: "text-green-700 bg-green-100",
        label: isArabic ? "مكتمل" : "Completed",
      },
      CANCELLED: {
        icon: XCircle,
        color: "text-red-600 bg-red-50",
        label: isArabic ? "ملغي" : "Cancelled",
      },
    };

    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(order?.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className="w-full bg-white shadow-md border overflow-hidden"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <CardHeader className="border-b bg-gray-50/50 py-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" />
          {isArabic ? "تتبع الطلب" : "Order Tracking"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Top Row: Order ID and Status Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 font-medium">
              {isArabic ? "رقم الطلب" : "Order Number"}
            </p>
            <p className="text-xl font-mono font-bold text-gray-900">
              #{order?.id?.slice(0, 8).toUpperCase() || "N/A"}
            </p>
          </div>

          <div className="space-y-2 w-full sm:w-auto">
            <p className="text-xs text-gray-500 font-medium sm:text-end">
              {isArabic ? "الحالة الحالية" : "Current Status"}
            </p>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${statusConfig.color}`}
            >
              <StatusIcon className="w-5 h-5" />
              <span className="text-sm whitespace-nowrap">
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Middle Row: Quantity and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">
              {isArabic ? "الكمية" : "Quantity"}
            </p>
            <p className="text-lg font-bold text-gray-800">
              {order?.quantity || 0}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">
              {isArabic ? "إجمالي السعر" : "Total Price"}
            </p>
            <p className="text-lg font-bold text-green-600">
              ${(order?.unit_price * order?.quantity).toFixed(2) || 0}
            </p>
          </div>
        </div>

        {/* Bottom Section: Delivery Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Truck className="w-4 h-4" />
            <p className="text-sm font-semibold">
              {isArabic ? "عنوان التوصيل" : "Delivery Address"}
            </p>
          </div>
          <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed">
              {order?.delivery_address ||
                (isArabic ? "لم يتم تحديد عنوان" : "No address provided")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusCard;
