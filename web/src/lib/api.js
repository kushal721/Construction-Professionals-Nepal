// Thin fetch wrapper around the backend API.
// In development Vite proxies /api and /uploads, so the base is same-origin.
export const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const TOKEN_KEY = "cpn-token";

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const toQuery = (params) => {
  if (!params) return "";
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return qs ? `?${qs}` : "";
};

/**
 * api("/designs", { params })            GET
 * api("/designs", { method: "POST", body })  JSON or FormData body
 */
export async function api(path, { method = "GET", body, params, signal } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_ORIGIN}/api${path}${toQuery(params)}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data?.message || `Request failed (${res.status})`);
  }
  return data;
}

// Resolves a stored upload path ("uploads/x.jpg" or "uploads\\x.jpg") to a URL.
export const fileUrl = (p) => {
  if (!p) return "";
  if (/^(https?:|blob:|data:)/.test(p)) return p;
  return `${API_ORIGIN}/${p.replace(/\\/g, "/").replace(/^\//, "")}`;
};
