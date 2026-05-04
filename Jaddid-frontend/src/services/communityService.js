// // // Community API Service - Notifications and Reviews
// // import api from "./api";

// // const communityService = {
// //   // ========== NOTIFICATIONS ==========
// //   notifications: {
// //     getAll: (params) => api.get("/community/notifications/", { params }),
// //     getUnreadCount: () => api.get("/community/notifications/unread_count/"),
// //     markAsRead: (id) =>
// //       api.post(`/community/notifications/${id}/mark_as_read/`),
// //   },

// //   // ========== REVIEWS ==========
// //   reviews: {
// //     getAll: (params) => api.get("/community/reviews/", { params }),
// //     create: (data) => api.post("/community/reviews/", data),
// //   },
// // };

// // export default communityService;
// // export { markAsRead };

// // Community API Service - Notifications and Reviews
// import api from "./api";

// const communityService = {
//   // ========== NOTIFICATIONS ==========
//   notifications: {
//     getAll: (params) => api.get("/community/notifications/", { params }),
//     // Try common notification unread-count endpoints to avoid 404s
//     getUnreadCount: async () => {
//       const endpoints = ["/community/notifications/unread_count/"];
//       for (const ep of endpoints) {
//         try {
//           const res = await api.get(ep);
//           return res;
//         } catch (err) {
//           if (!err.response || err.response.status >= 500) throw err;
//         }
//       }
//       // fallback to empty count
//       return { data: { count: 0 } };
//     },
//     markAsRead: (id) =>
//       api.post(`/community/notifications/${id}/mark_as_read/`),
//     markAllAsRead: () => api.post("/community/notifications/mark_all_as_read/"),
//   },

//   // ========== REVIEWS ==========
//   reviews: {
//     getAll: (params) => api.get("/community/reviews/", { params }),
//     create: (data) => api.post("/community/reviews/", data),
//   },
// };

// export default communityService;

// Community API Service - Notifications and Reviews
import api from "./api";

const communityService = {
  // ========== NOTIFICATIONS ==========
  notifications: {
    getAll: (params) => api.get("/community/notifications/", { params }),

    getUnreadCount: async () => {
      try {
        const res = await api.get("/community/notifications/unread_count/");
        return res;
      } catch (err) {
        console.warn("Failed to fetch unread count:", err);
        // Fallback to 0 if endpoint fails
        return { data: { unread_count: 0 } };
      }
    },

    markAsRead: (id) =>
      api.post(`/community/notifications/${id}/mark_as_read/`),

    markAllAsRead: () => api.post("/community/notifications/mark_all_as_read/"),
  },

  // ========== REVIEWS ==========
  reviews: {
    getAll: (params) => api.get("/community/reviews/", { params }),

    create: async (data) => {
      try {
        console.log("📤 Sending review to backend:", data);
        const response = await api.post("/community/reviews/", data);
        console.log("✅ Review created successfully:", response.data);
        return response;
      } catch (error) {
        console.error("❌ Review creation failed:", error);
        console.error("📦 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        throw error;
      }
    },

    getByProduct: (productId) =>
      api.get("/community/reviews/", { params: { product_id: productId } }),

    getByUser: (userId) =>
      api.get("/community/reviews/", { params: { target_user: userId } }),
  },
};

export default communityService;
