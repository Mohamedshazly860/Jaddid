// class PushNotificationService {
//   constructor() {
//     this.registration = null;
//     this.vapidPublicKey = null; // Will be fetched from backend
//   }

//   async registerServiceWorker() {
//     if ("serviceWorker" in navigator) {
//       try {
//         const registration = await navigator.serviceWorker.register("/sw.js");
//         this.registration = registration;
//         console.log("Service Worker registered successfully");
//         return registration;
//       } catch (error) {
//         console.error("Service Worker registration failed:", error);
//         return null;
//       }
//     }
//     return null;
//   }

//   async requestPermission() {
//     if (!("Notification" in window)) {
//       console.warn("This browser does not support notifications");
//       return false;
//     }

//     if (Notification.permission === "granted") {
//       return true;
//     }

//     if (Notification.permission === "denied") {
//       return false;
//     }

//     const permission = await Notification.requestPermission();
//     return permission === "granted";
//   }

//   async subscribeToPush() {
//     if (!this.registration) {
//       await this.registerServiceWorker();
//     }

//     try {
//       // تعديل الرابط ليصبح كاملاً (Full URL)
//       const response = await fetch(
//         "http://127.0.0.1:8000/api/push/vapid-public-key/"
//       );

//       // نتحقق أولاً هل الرد ناجح؟
//       if (!response.ok) throw new Error("Failed to fetch VAPID key");

//       const data = await response.json();
//       this.vapidPublicKey = data.public_key;

//       const subscription = await this.registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
//       });

//       await this.sendSubscriptionToBackend(subscription);
//       return subscription;
//     } catch (error) {
//       console.error("Error subscribing to push notifications:", error);
//       throw error;
//     }
//   }
//   async sendSubscriptionToBackend(subscription) {
//     const token = localStorage.getItem("access_token");
//     if (!token) return;

//     try {
//       // تعديل الرابط هنا أيضاً
//       await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           push_token: JSON.stringify(subscription),
//         }),
//       });
//     } catch (error) {
//       console.error("Error sending subscription to backend:", error);
//     }
//   }

//   urlBase64ToUint8Array(base64String) {
//     const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//     const base64 = (base64String + padding)
//       .replace(/\-/g, "+") // تأكد من الـ backslash هنا
//       .replace(/_/g, "/");

//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);

//     for (let i = 0; i < rawData.length; ++i) {
//       outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
//   }

//   async showNotification(title, options = {}) {
//     if (this.registration) {
//       await this.registration.showNotification(title, options);
//     } else {
//       // Fallback to regular notification
//       if (Notification.permission === "granted") {
//         new Notification(title, options);
//       }
//     }
//   }
// }

// export default new PushNotificationService();
class PushNotificationService {
  constructor() {
    this.registration = null;
    this.vapidPublicKey = null;
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        // تأكد أن ملف sw.js موجود داخل مجلد public في الـ React
        const registration = await navigator.serviceWorker.register("/sw.js");
        this.registration = registration;
        console.log("Service Worker registered successfully");
        return registration;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return null;
      }
    }
    return null;
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.warn("Notifications permission denied by user");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async subscribeToPush() {
    try {
      if (!this.registration) {
        throw new Error("Service worker not registered");
      }

      // ✅ تحقق من وجود الـ VAPID key
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn("VAPID public key not found in environment variables");
        return null; // Return early instead of crashing
      }

      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // ✅ تحقق من نجاح التحويل
      if (!applicationServerKey || applicationServerKey.length === 0) {
        console.warn("Failed to convert VAPID key to Uint8Array");
        return null;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);

      console.log("Push notification subscription successful");
      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  }
  async sendSubscriptionToBackend(subscription) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("No access token found, skipping backend subscription save");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/profile/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            push_token: JSON.stringify(subscription),
          }),
        }
      );

      if (response.ok) {
        console.log("Subscription saved to backend profile successfully");
      } else {
        console.error("Failed to save subscription to backend");
      }
    } catch (error) {
      console.error("Error sending subscription to backend:", error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    if (!base64String || typeof base64String !== "string") {
      console.warn("Invalid VAPID public key:", base64String);
      // Return empty Uint8Array to prevent crash
      return new Uint8Array(0);
    }

    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async showNotification(title, options = {}) {
    if (this.registration) {
      await this.registration.showNotification(title, options);
    } else {
      if (Notification.permission === "granted") {
        new Notification(title, options);
      }
    }
  }
}

export default new PushNotificationService();
