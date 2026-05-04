import { useState, useEffect, useCallback, useRef } from "react";
import ordersService from "../services/ordersService";

// Debug toggle: set localStorage.setItem('debug_order_tracking','1') in browser to enable
const DEBUG_TRACKING =
  typeof window !== "undefined" &&
  localStorage.getItem("debug_order_tracking") === "1";

export const useOrderTracking = (orderId) => {
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Internal mock state for debug mode
  const mockStateRef = useRef({
    initialized: false,
    step: 0,
    courierPos: null,
  });

  const fetchOrderData = useCallback(async () => {
    if (!orderId) return;

    // Debug simulation mode: skip network calls and simulate lifecycle
    if (DEBUG_TRACKING) {
      try {
        // Initialize mock order once
        if (!mockStateRef.current.initialized) {
          const initialOrder = {
            id: orderId,
            status: "IN_PROGRESS", // start at in-progress (seller prepared)
            courier_assignment: null,
            latitude: 30.049789, // sample customer lat/lng
            longitude: 31.233234,
            buyer_name: "Mock Buyer",
            seller_name: "Mock Seller",
          };
          setOrder(initialOrder);
          setTracking(null);
          mockStateRef.current.initialized = true;

          // After a short delay assign a courier (simulate backend assignment)
          setTimeout(() => {
            setOrder((prev) =>
              prev
                ? {
                    ...prev,
                    courier_assignment: {
                      id: "mock-assignment-1",
                      courier_id: "c1",
                      courier_name: "Mock Courier",
                    },
                    status: "COURIER_ASSIGNED",
                  }
                : prev
            );
          }, 3000);

          // After 30s, start delivery (ON_THE_WAY)
          setTimeout(() => {
            setOrder((prev) =>
              prev ? { ...prev, status: "ON_THE_WAY" } : prev
            );
            // initialize courier position and tracking
            const startPos = {
              latitude: 30.045,
              longitude: 31.23,
              estimated_time: 12,
              distance_remaining: 5.0,
            };
            mockStateRef.current.courierPos = startPos;
            setTracking({
              latest_location: startPos,
              courier_name: "Mock Courier",
            });
          }, 30000);
        } else {
          // If already ON_THE_WAY, simulate periodic updates (called by polling)
          if (order?.status === "ON_THE_WAY") {
            const cur = mockStateRef.current.courierPos || {
              latitude: 30.045,
              longitude: 31.23,
              estimated_time: 12,
              distance_remaining: 5.0,
            };
            // Move courier slightly toward customer
            const customerLat =
              order.latitude || order.customer_lat || 30.049789;
            const customerLng =
              order.longitude || order.customer_lng || 31.233234;
            const latDelta = (customerLat - cur.latitude) * 0.05;
            const lngDelta = (customerLng - cur.longitude) * 0.05;
            const next = {
              latitude: cur.latitude + latDelta,
              longitude: cur.longitude + lngDelta,
              estimated_time: Math.max(
                1,
                Math.round((cur.estimated_time || 10) - 1)
              ),
              distance_remaining: Math.max(
                0,
                (cur.distance_remaining || 5) - 0.5
              ),
            };
            mockStateRef.current.courierPos = next;
            setTracking({
              latest_location: next,
              courier_name: "Mock Courier",
            });
          }
        }

        setError(null);
      } catch (err) {
        console.error("Mock tracking error:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }

      return;
    }

    // Real network implementation
    try {
      const orderPromise = ordersService.getOrder(orderId);
      const trackingPromise = ordersService.getTracking(orderId);

      const [orderRes, trackingRes] = await Promise.allSettled([
        orderPromise,
        trackingResPromise(trackingPromise),
      ]);

      if (orderRes.status === "fulfilled") {
        setOrder(orderRes.value.data);
      }

      if (trackingRes && trackingRes.status === "fulfilled") {
        setTracking(trackingRes.value.data);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching order data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId, order?.status]);

  // helper to safely await tracking promise (some backends may 404)
  const trackingResPromise = async (p) => {
    try {
      return await p;
    } catch (err) {
      return { status: "rejected", reason: err };
    }
  };

  // Helper to detect live tracking statuses (accepts multiple backend variants)
  const isLiveStatus = (status) => {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return (
      s === "on_the_way" ||
      s === "on-the-way" ||
      s === "ontheway" ||
      s === "on the way" ||
      s === "in_way" ||
      s === "in-way" ||
      s === "in_way" ||
      s === "in the way" ||
      s === "on_the_way" ||
      s === "on_the_way" ||
      s.includes("way")
    );
  };

  // Poll for updates every 5 seconds while tracking page is open
  useEffect(() => {
    if (!orderId) return;

    fetchOrderData();
    intervalRef.current = setInterval(fetchOrderData, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId, fetchOrderData]);

  return { order, tracking, loading, error, refetch: fetchOrderData };
};
