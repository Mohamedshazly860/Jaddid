import { useState, useEffect, useCallback, useRef } from "react";
import orderService from "@/services/ordersService";

export const useOrderTracking = (orderId) => {
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrderData = useCallback(async () => {
    if (!orderId) return;

    try {
      const [orderRes, trackingRes] = await Promise.allSettled([
        orderService.getOrder(orderId),
        orderService.getTracking(orderId),
      ]);

      if (orderRes.status === "fulfilled") {
        setOrder(orderRes.value.data);
      }

      if (trackingRes.status === "fulfilled") {
        setTracking(trackingRes.value.data);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching order data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Poll for updates every 5 seconds when order is in progress
  useEffect(() => {
    if (!orderId) return;

    fetchOrderData();

    // Only poll if order is in progress or on the way
    if (order?.status === "IN_PROGRESS" || order?.status === "ON_THE_WAY") {
      intervalRef.current = setInterval(fetchOrderData, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId, order?.status, fetchOrderData]);

  return { order, tracking, loading, error, refetch: fetchOrderData };
};
