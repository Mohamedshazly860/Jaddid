import api from "./api";

const orderService = {
  create: (data) => api.post("/orders/orders/", data),
  getOrder: (orderId) => api.get(`/orders/orders/${orderId}/`),
  getTracking: (orderId) => {
    return api.get(`/logistics/tracking/${orderId}//`);
  },
  assignCourier: (orderId) => {
    return api.post(`/logistics/order/${orderId}/assign/`);
  },
  getCourierInfo: (assignmentId) => {
    return api.get(`/logistics/assignment/${assignmentId}/`);
  },
  startDelivery: (assignmentId) => {
    return api.post(`/logistics/assignment/${assignmentId}/start/`);
  },
  confirm: (orderId) => api.post(`/orders/orders/${orderId}/confirm/`),
};

export default orderService;
