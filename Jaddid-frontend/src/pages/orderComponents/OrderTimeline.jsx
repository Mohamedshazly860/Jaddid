import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, Clock, PackageCheck } from "lucide-react";

const OrderTimeline = ({ order, isArabic }) => {
  const steps = [
    { key: "PENDING", label: isArabic ? "تم تقديم الطلب" : "Order Placed" },
    { key: "CONFIRMED", label: isArabic ? "تأكيد البائع" : "Seller Confirmed" },
    { key: "IN_PROGRESS", label: isArabic ? "قيد التجهيز" : "In Progress" },
    {
      key: "COURIER_ASSIGNED",
      label: isArabic ? "تعيين السائق" : "Courier Assigned",
    },
    { key: "ON_THE_WAY", label: isArabic ? "في الطريق" : "On the Way" },
    { key: "DELIVERED", label: isArabic ? "تم التوصيل" : "Delivered" },
    { key: "COMPLETED", label: isArabic ? "مكتمل" : "Completed" },
  ];

  const currentIndex = steps.findIndex((step) => step.key === order?.status);

  return (
    <Card
      className="w-full bg-white shadow-sm border-0 sm:border"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <CardHeader className="border-b bg-gray-50/30 py-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <PackageCheck className="w-5 h-5 text-[#708A58]" />
          {isArabic ? "سير الطلب" : "Order Progress"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="relative flex flex-col space-y-0">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={step.key} className="relative flex items-start group">
                {/* Visual Connector Container */}
                <div className="flex flex-col items-center">
                  {/* Icon Indicator */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                      isCurrent
                        ? "bg-[#708A58] text-white ring-4 ring-green-100"
                        : isCompleted
                        ? "bg-[#708A58] text-white"
                        : "bg-white border-2 border-gray-200 text-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Circle className="w-4 h-4 fill-current" />
                    )}
                  </div>

                  {/* Connecting Vertical Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 -my-1 transition-colors duration-500 ${
                        index < currentIndex ? "bg-[#708A58]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Label and Status Details */}
                <div
                  className={`flex flex-col pb-8 ${isArabic ? "pr-4" : "pl-4"}`}
                >
                  <span
                    className={`text-sm font-bold transition-colors ${
                      isCurrent
                        ? "text-[#708A58]"
                        : isUpcoming
                        ? "text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    {step.label}
                  </span>

                  {isCurrent && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="flex h-2 w-2 rounded-full bg-[#708A58] animate-ping" />
                      <span className="text-[11px] font-medium text-[#708A58] uppercase tracking-wider">
                        {isArabic ? "الحالة الحالية" : "Current Status"}
                      </span>
                    </div>
                  )}

                  {isCompleted && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {isArabic ? "مكتمل" : "Completed"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
