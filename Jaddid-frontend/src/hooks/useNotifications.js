import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationWebSocket from "@/services/notificationWebSocket";
import PushNotificationService from "@/services/pushNotificationService";

export const useNotifications = () => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const ws = new NotificationWebSocket(token);

    ws.onMessage = (data) => {
      if (data.type === "notification") {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } else if (data.type === "unread_count") {
        setUnreadCount(data.count);
      }
    };

    ws.onConnectionChange = (connected) => {
      setWsConnected(connected);
    };

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [isAuthenticated, user]);

  // Push Notifications
  const initPushNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("Push notifications not supported in this browser");
        return;
      }

      // VAPID key
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.log("Push notifications disabled: VAPID key not configured");
        return;
      }

      const pushService = new PushNotificationService();
      await pushService.init();

      const subscription = await pushService.subscribeToPush();

      if (subscription) {
        console.log("Push notifications initialized successfully");
      } else {
        console.log("Push notifications subscription failed");
      }
    } catch (error) {
      console.error("Error initializing push notifications:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      initPushNotifications();
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Call API to mark as read
      // await api.post(`/notifications/${notificationId}/read/`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Call API to mark all as read
      // await api.post('/notifications/mark-all-read/');

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    wsConnected,
    markAsRead,
    markAllAsRead,
  };
};

export default useNotifications;
