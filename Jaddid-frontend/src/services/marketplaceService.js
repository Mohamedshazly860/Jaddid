// Marketplace API Service - All Endpoints
import api from "./api";

const marketplaceService = {
  // ========== CATEGORIES ==========
  categories: {
    getAll: () => api.get("/marketplace/categories/"),
    getById: (id) => api.get(`/marketplace/categories/${id}/`),
    getTree: () => api.get("/marketplace/categories/tree/"),
    getProducts: (id) => api.get(`/marketplace/categories/${id}/products/`),
  },

  // ========== MATERIALS (Master Data) ==========
  materials: {
    getAll: (params) => api.get("/marketplace/materials/", { params }),
    getById: (id) => api.get(`/marketplace/materials/${id}/`),
    getListings: (id) => api.get(`/marketplace/materials/${id}/listings/`),
  },

  // ========== MATERIAL LISTINGS ==========
  materialListings: {
    getAll: (params) => api.get("/marketplace/material-listings/", { params }),
    getById: (id) => api.get(`/marketplace/material-listings/${id}/`),
    getMyListings: () => api.get("/marketplace/material-listings/my_listings/"),
    getSellerItems: (sellerId) =>
      api.get(`/marketplace/material-listings/seller/${sellerId}/`),
    create: (data) =>
      api.post("/marketplace/material-listings/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    update: (id, data) =>
      api.patch(`/marketplace/material-listings/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    delete: (id) => api.delete(`/marketplace/material-listings/${id}/`),
    toggleFavorite: (id) =>
      api.post(`/marketplace/material-listings/${id}/toggle_favorite/`),
    publish: (id) => api.post(`/marketplace/material-listings/${id}/publish/`),

    getReviews: (id) =>
      api.get(`/community/reviews/`, { params: { product_id: id } }),
  },

  // ========== PRODUCTS ==========
  products: {
    getAll: (params) => api.get("/marketplace/products/", { params }),
    getById: (id) => api.get(`/marketplace/products/${id}/`),
    getMyProducts: () => api.get("/marketplace/products/my_products/"),
    create: (data) =>
      api.post("/marketplace/products/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    update: (id, data) =>
      api.patch(`/marketplace/products/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    delete: (id) => api.delete(`/marketplace/products/${id}/`),
    toggleFavorite: (id) =>
      api.post(`/marketplace/products/${id}/toggle_favorite/`),
    publish: (id) => api.post(`/marketplace/products/${id}/publish/`),
    getReviews: (id) =>
      api.get(`/community/reviews/`, { params: { product_id: id } }),
  },

  // ========== CART ==========
  cart: {
    get: () => api.get("/marketplace/cart/"),
    addItem: (data) => api.post("/marketplace/cart/add_item/", data),
    updateItem: (data) => api.post("/marketplace/cart/update_item/", data),
    removeItem: (data) => api.post("/marketplace/cart/remove_item/", data),
    clear: () => api.post("/marketplace/cart/clear/"),
  },

  // ========== FAVORITES ==========
  favorites: {
    getAll: () => api.get("/marketplace/favorites/"),
    add: (data) => api.post("/marketplace/favorites/", data),
    remove: (id) => api.delete(`/marketplace/favorites/${id}/`),
  },

  // ========== ORDERS ==========
  orders: {
    getAll: () => api.get("/orders/orders/"),
    getById: (id) => api.get(`/orders/orders/${id}/`),
    getPurchases: () => api.get("/orders/"),
    getSales: () => api.get("/orders/"),
    // Order creation should use the orders app endpoint
    create: (data) => api.post("/orders/orders/", data),
    confirm: (id) => api.post(`/orders/orders/${id}/confirm/`),
    complete: (id) => api.post(`/orders/orders/${id}/complete/`),
    cancel: (id) => api.post(`/orders/orders/${id}/cancel/`),
  },

  // ========== REVIEWS ==========
  reviews: {
    getAll: (params) => api.get("/marketplace/reviews/", { params }),
    create: (data) => api.post("/marketplace/reviews/", data),
    update: (id, data) => api.patch(`/marketplace/reviews/${id}/`, data),
    delete: (id) => api.delete(`/marketplace/reviews/${id}/`),
  },

  // ========== MESSAGES ==========
  messages: {
    getAll: () => api.get("/marketplace/messages/"),
    getInbox: () => api.get("/marketplace/messages/inbox/"),
    getSent: () => api.get("/marketplace/messages/sent/"),
    send: (data) => api.post("/marketplace/messages/", data),
    markRead: (id) => api.post(`/marketplace/messages/${id}/mark_read/`),
  },

  // ========== REPORTS ==========
  reports: {
    getAll: () => api.get("/marketplace/reports/"),
    getMyReports: () => api.get("/marketplace/reports/my_reports/"),
    create: (data) => api.post("/marketplace/reports/", data),
  },
};

export default marketplaceService;
