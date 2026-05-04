import api from "./api";

const tryEndpoints = async (endpoints, config) => {
  for (const ep of endpoints) {
    try {
      console.debug(`[ordersService] trying GET ${ep}`);
      const res = await api.get(ep, config);
      console.debug(`[ordersService] success GET ${ep} ->`, res.status);
      return res;
    } catch (err) {
      const status = err.response?.status;
      console.debug(
        `[ordersService] failed GET ${ep} -> ${status ?? err.code}`,
        err.response?.data || err.message
      );
      if (!err.response || err.response.status >= 500) throw err;
    }
  }
  console.warn("[ordersService] all GET endpoints failed", endpoints);
  throw new Error("All endpoints failed");
};

const tryPostEndpoints = async (endpoints, data, config) => {
  for (const ep of endpoints) {
    try {
      console.debug(`[ordersService] trying POST ${ep}`);
      const res = await api.post(ep, data, config);
      console.debug(`[ordersService] success POST ${ep} ->`, res.status);
      return res;
    } catch (err) {
      const status = err.response?.status;
      console.debug(
        `[ordersService] failed POST ${ep} -> ${status ?? err.code}`,
        err.response?.data || err.message
      );
      if (!err.response || err.response.status >= 500) throw err;
    }
  }
  console.warn("[ordersService] all POST endpoints failed", endpoints);
  throw new Error("All POST endpoints failed");
};

const ordersService = {
  create: async (data) => {
    const orderResponse = await api.post("/orders/", data);
    const order = orderResponse.data;

    if (order && order.id) {
      try {
        const assignmentResponse = await ordersService.assignCourier(order.id);
        console.log(
          `[ordersService] Courier assignment response:`,
          assignmentResponse.data
        );

        if (
          !assignmentResponse.data ||
          !assignmentResponse.data.assignment_id
        ) {
          console.warn(
            `[ordersService] Warning: Assignment endpoint returned success but no assignment_id found`
          );
          console.warn(
            `[ordersService] Response data:`,
            assignmentResponse.data
          );
        } else {
          console.log(
            `[ordersService] Successfully assigned courier to order ${order.id}`
          );
        }
      } catch (err) {
        console.error(
          `[ordersService] Failed to assign courier to order ${order.id}:`,
          err
        );
        console.error(`[ordersService] Error response:`, err.response?.data);
      }
    }

    return orderResponse;
  },
  getAll: () => api.get("/orders/"),

  getById: async (orderId) => {
    return api.get(`/orders/orders/${orderId}/`);
  },

  getOrder: async (orderId) => ordersService.getById(orderId),

  getTracking: async (orderId) => {
    const endpoints = [
      `/logistics/tracking/${orderId}/`,
      `/logistics/tracking/${orderId}`,
    ];
    return tryEndpoints(endpoints);
  },

  assignCourier: async (orderId, data = {}) => {
    const endpoints = [
      `/logistics/order/${orderId}/assign/`,
      `/logistics/order/${orderId}/assign`,
    ];
    return tryPostEndpoints(endpoints, data);
  },

  startDelivery: async (assignmentId, data = {}) => {
    const endpoints = [
      `/logistics/assignment/${assignmentId}/start/`,
      `/logistics/assignment/${assignmentId}/start`,
    ];
    return tryPostEndpoints(endpoints, data);
  },

  buyerUpdate: (id, data) =>
    api.patch(`/orders/orders/${id}/buyer_update/`, data),

  cancel: (id) => api.post(`/orders/orders/${id}/cancel/`),

  getPurchases: () => api.get("/orders/orders/my_orders"),
  getSales: () => api.get("/orders/orders/seller_orders"),

  // Stripe payment methods
  createPaymentIntent: (data) =>
    api.post("/orders/payments/create-intent/", data),

  confirmPayment: (data) => api.post("/orders/orders/", data),

  assignCourierManually: async (orderId) => {
    try {
      console.log(
        `[ordersService] Manually assigning courier to order ${orderId}`
      );
      const response = await ordersService.assignCourier(orderId);
      console.log(`[ordersService] Assignment response:`, response.data);
      return response;
    } catch (err) {
      console.error(`[ordersService] Manual assignment failed:`, err);
      throw err;
    }
  },
};

export default ordersService;
