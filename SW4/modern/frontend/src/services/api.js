/**
 * Jednoduchý API klient nad fetch.
 *
 * Větší aplikace by možná používala Axios nebo React Query, ale pro studijní
 * projekt je explicitní práce s fetch dobrá, protože je dobře vidět celý tok
 * request -> response -> error handling.
 */

const API_BASE_URL = "http://127.0.0.1:8001";

function getHeaders(token) {
  // Všechny requesty do API posílají JSON. Pokud uživatel prošel loginem,
  // připojujeme i Bearer token, který backend používá pro autorizaci.
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(path, options = {}) {
  // Jedno centrální místo pro volání fetch je praktické:
  // - máme sjednocené zpracování chyb,
  // - nemusíme v každé metodě opakovat stejnou logiku,
  // - a snadno bychom sem později doplnili třeba refresh tokenu.
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(payload?.detail ?? "Požadavek selhal.");
  }

  return payload;
}

export const api = {
  // Jednotlivé metody tvoří tenkou servisní vrstvu nad REST API.
  // React komponenty tak neřeší URL endpointů ani HTTP metody přímo.
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    }),
  fetchDashboard: (token) =>
    request("/dashboard", {
      headers: getHeaders(token)
    }),
  fetchProducts: (token) =>
    request("/products", {
      headers: getHeaders(token)
    }),
  createProduct: (token, payload) =>
    request("/products", {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    }),
  updateProduct: (token, productId, payload) =>
    request(`/products/${productId}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    }),
  deleteProduct: (token, productId) =>
    request(`/products/${productId}`, {
      method: "DELETE",
      headers: getHeaders(token)
    }),
  fetchOrders: (token) =>
    request("/orders", {
      headers: getHeaders(token)
    }),
  createOrder: (token, payload) =>
    request("/orders", {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    }),
  updateOrderStatus: (token, orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify({ status })
    }),
  fetchUsers: (token) =>
    request("/users", {
      headers: getHeaders(token)
    }),
  createUser: (token, payload) =>
    request("/users", {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
};
