import ReconnectingWebSocket from "reconnecting-websocket";

// class NotificationWebSocket {
//   constructor() {
//     this.socket = null;
//     this.isConnected = false;
//     this.listeners = [];
//   }

//   connect(token) {
//     if (this.socket) {
//       this.socket.close();
//     }

//     const wsUrl = `ws://localhost:8000/ws/notifications/`;

//     console.log("Attempting WebSocket connection to:", wsUrl);

//     this.socket = new ReconnectingWebSocket(wsUrl, [], {
//       connectionTimeout: 1000,
//       maxRetries: 10,
//     });

//     this.socket.onopen = () => {
//       console.log("WebSocket connected successfully");
//       this.isConnected = true;
//       // Send authentication
//       if (token) {
//         this.socket.send(
//           JSON.stringify({
//             type: "authenticate",
//             token: token,
//           })
//         );
//       }
//     };

//     this.socket.onmessage = (event) => {
//       console.log("WebSocket message received:", event.data);
//       try {
//         const data = JSON.parse(event.data);
//         if (data.type === "authenticated") {
//           if (data.success) {
//             console.log("WebSocket authentication successful");
//           } else {
//             console.error("WebSocket authentication failed:", data.error);
//             this.socket.close();
//           }
//         } else {
//           this.notifyListeners(data);
//         }
//       } catch (error) {
//         console.error("Error parsing WebSocket message:", error);
//       }
//     };

//     this.socket.onclose = (event) => {
//       console.log("WebSocket disconnected:", event.code, event.reason);
//       this.isConnected = false;
//     };

//     this.socket.onerror = (error) => {
//       console.error("WebSocket error occurred:", error);
//     };
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//       this.isConnected = false;
//     }
//   }

//   addListener(callback) {
//     this.listeners.push(callback);
//   }

//   removeListener(callback) {
//     this.listeners = this.listeners.filter((listener) => listener !== callback);
//   }

//   notifyListeners(data) {
//     this.listeners.forEach((callback) => {
//       try {
//         callback(data);
//       } catch (error) {
//         console.error("Error in WebSocket listener:", error);
//       }
//     });
//   }

//   getConnectionStatus() {
//     return this.isConnected;
//   }
// }

// export default new NotificationWebSocket();

class NotificationWebSocket {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.onMessage = null;
    this.onConnectionChange = null;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/notifications/`;
    console.log("Attempting WebSocket connection to:", wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected successfully");
        this.reconnectAttempts = 0;
        this.onConnectionChange?.(true);

        // Send authentication token
        if (this.token) {
          this.ws.send(
            JSON.stringify({
              type: "authenticate",
              token: this.token,
            })
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          if (data.type === "authenticated" && data.success) {
            console.log("WebSocket authentication successful");
          }

          this.onMessage?.(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.onConnectionChange?.(false);
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code);
        this.onConnectionChange?.(false);

        // Auto-reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      this.onConnectionChange?.(false);
    }
  }

  disconnect() {
    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
      this.ws.close();
      this.ws = null;
    }
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected");
    }
  }
}

// ✅ CRITICAL: استخدم default export
export default NotificationWebSocket;
