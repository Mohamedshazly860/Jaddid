import { useNotifications } from "@/hooks/useNotifications";

const NotificationInitializer = () => {
  useNotifications(); // Initialize WebSocket and push notifications
  return null; // This component doesn't render anything
};

export default NotificationInitializer;
