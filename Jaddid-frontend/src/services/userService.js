// User & Profile API Service
import api from "./api";

const tryEndpoints = async (endpoints, config) => {
  for (const ep of endpoints) {
    try {
      const res = await api.get(ep, config);
      return res;
    } catch (err) {
      // continue trying next endpoint on 4xx/5xx
      if (!err.response || err.response.status >= 500) throw err;
    }
  }
  // if none succeeded, throw a generic error
  throw new Error("All endpoints failed");
};

const userService = {
  // Basic user endpoints (try common paths if backend varies)
  getCurrentUser: async () => {
    // direct endpoint for current user
    return api.get("/accounts/me/");
  },

  // Fetch both user and profile data in parallel for faster loading
  getCurrentUserWithProfile: async () => {
    try {
      // Fetch both endpoints in parallel
      const [userRes, profileRes] = await Promise.all([
        api.get("/accounts/me/"),
        api.get("/accounts/profile/").catch(err => {
          // Profile endpoint might fail, but user data is enough
          console.warn("Profile endpoint failed, using user data only:", err);
          return null;
        })
      ]);

      // Merge data: user already has nested profile, but also add direct profile response
      const userData = userRes.data;
      
      if (profileRes && profileRes.data) {
        // Merge profile data
        if (userData.profile) {
          userData.profile = { ...userData.profile, ...profileRes.data };
        } else {
          userData.profile = profileRes.data;
        }
      }

      return { data: userData };
    } catch (error) {
      // Fallback to just user data
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  },

  getUserById: async (id) => {
    const endpoints = [
      `/accounts/users/${id}/`,
      `/accounts/profile/${id}/`,
      `/accounts/user/${id}/`,
    ];
    return tryEndpoints(endpoints);
  },

  // Lookup user by email - useful to resolve seller_id from seller_email
  getUserByEmail: async (email) => {
    if (!email) return Promise.resolve(null);
    const endpoints = [
      `/accounts/users/?email=${encodeURIComponent(email)}`,
      `/accounts/users/search/?email=${encodeURIComponent(email)}`,
      `/accounts/user-by-email/${encodeURIComponent(email)}/`,
      `/users/?email=${encodeURIComponent(email)}`,
    ];
    for (const ep of endpoints) {
      try {
        const res = await api.get(ep);
        // backend may return list or single object
        if (Array.isArray(res.data)) {
          if (res.data.length > 0) return res.data[0];
        } else if (res.data?.results) {
          if (res.data.results.length > 0) return res.data.results[0];
        } else if (res.data?.id) {
          return res.data;
        }
      } catch (err) {
        // try next
      }
    }
    return null;
  },

  updateUser: (id, data) => {
    // support JSON or FormData - let axios set Content-Type for FormData
    return api.patch(`/accounts/users/${id}/`, data);
  },

  updateCurrentUser: (data) => {
    // backend provides a dedicated endpoint for partial updates
    return api.patch("/accounts/me/basic/", data);
  },

  updateCurrentUserPut: (data) => {
    // backend expects PUT on the /me/update/ route
    return api.put("/accounts/me/update/", data);
  },

  deleteCurrentUser: () => api.delete("/accounts/me/delete/"),

  // Profile-related wrappers
  getUserProfile: (userId) => api.get(`/accounts/users/${userId}/`),

  uploadProfileImage: (formData) => {
    return api.put("/accounts/profile/image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getUserReviews: (userId) => {
    return api.get(`/community/reviews/?target_user=${userId}`);
  },
};

export default userService;
