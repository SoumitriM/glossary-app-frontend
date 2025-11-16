import { toast } from "react-toastify";

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      toast.warn("Session expired. Please log in again.");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data.error || data.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

export const api = {
  get: (url) => apiFetch(url, { method: "GET" }),
  post: (url, body = {}) =>
    apiFetch(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body = {}) =>
    apiFetch(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body = {}) =>
    apiFetch(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url, body) =>
    apiFetch(url, {
      method: "DELETE",
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
};
