import React from "react";

const steps = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_progress", label: "In Progress" },
  { key: "courier_assigned", label: "Courier Assigned" },
  { key: "on_the_way", label: "On The Way" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

const normalize = (s) =>
  s ? String(s).toLowerCase().replace(/\s+/g, "_") : "pending";

const OrderTimeline = ({ order }) => {
  const status = normalize(order?.order_status || order?.status);
  const activeIndex = Math.max(
    0,
    steps.findIndex((st) => status.includes(st.key))
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-4 overflow-x-auto">
        {steps.map((step, idx) => {
          const active = idx <= activeIndex;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  active
                    ? "bg-[#2D4F2B] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              <div className="text-xs text-gray-600">{step.label}</div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-1 w-8 ${
                    active ? "bg-[#708A58]" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
