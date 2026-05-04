import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Truck, CheckCircle, Package, MapPin } from "lucide-react";

const statusLabel = (s) => {
  if (!s) return "pending";
  const st = String(s).toLowerCase();
  if (st.includes("pending")) return "pending";
  if (st.includes("confirm")) return "confirmed";
  if (
    st.includes("in_progress") ||
    st.includes("in progress") ||
    st === "inprogress"
  )
    return "in_progress";
  if (st.includes("courier") || st.includes("assigned"))
    return "courier_assigned";
  if (st.includes("way") || st.includes("on_the_way")) return "on_the_way";
  if (st.includes("deliver")) return "delivered";
  if (st.includes("complete")) return "completed";
  return st;
};

const OrderStatusCard = ({ order, isArabic }) => {
  const s = statusLabel(order?.order_status || order?.status);
  const labels = {
    pending: isArabic
      ? "في انتظار تأكيد البائع"
      : "Waiting for seller confirmation",
    confirmed: isArabic ? "قيد التجهيز" : "Seller is preparing your order",
    in_progress: isArabic ? "جاري التجهيز" : "Being prepared",
    courier_assigned: isArabic ? "تم تعيين السائق" : "Courier assigned",
    on_the_way: isArabic ? "السائق في الطريق" : "Courier on the way",
    delivered: isArabic ? "تم التوصيل" : "Delivered",
    completed: isArabic ? "مكتمل" : "Completed",
  };

  const Icon = () => {
    switch (s) {
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case "confirmed":
        return <Package className="w-6 h-6 text-blue-500" />;
      case "in_progress":
        return <LoaderIcon />;
      case "courier_assigned":
        return <Truck className="w-6 h-6 text-indigo-500" />;
      case "on_the_way":
        return <MapPin className="w-6 h-6 text-green-600" />;
      case "delivered":
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const LoaderIcon = () => (
    <svg
      className="w-6 h-6 animate-spin text-[#708A58]"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        strokeOpacity="0.2"
      />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" />
    </svg>
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center gap-4">
        <div className="p-3 bg-[#FFF1CA] rounded-full">
          <Icon />
        </div>
        <div>
          <div className="text-sm text-gray-600">{labels[s] || s}</div>
          <div className="text-xs text-gray-400">
            {order?.order_id || order?.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusCard;
