import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
  AxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ============================================================
   AXIOS INSTANCE
============================================================ */

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* ============================================================
   LOGOUT HELPERS
============================================================ */

//  Only used for EXPLICIT user logout (button click)
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore backend failure
  } finally {
    forceLogout();
  }
};

// Used for token expiry / auth failure / banned user
const forceLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("user");

  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }

  if ("window" in globalThis) {
    globalThis.window.location.href = "/auth";
  }
};

/* ============================================================
   REQUEST INTERCEPTOR
============================================================ */

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders();
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }

  return config;
});

/* ============================================================
   TOKEN REFRESH LOGIC
============================================================ */

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const resolveRefreshQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve));
  }

  isRefreshing = true;

  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      null,
      { withCredentials: true }
    );

    const token = res.data?.accessToken ?? null;

    if (token) {
      localStorage.setItem("accessToken", token);
    }

    resolveRefreshQueue(token);
    return token;
  } catch {
    resolveRefreshQueue(null);
    forceLogout();
    return null;
  } finally {
    isRefreshing = false;
  }
};

/* ============================================================
   RESPONSE INTERCEPTOR
============================================================ */

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest?.url || "";
    const message = (error.response?.data?.message || "").toLowerCase();

    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/register") ||
      url.includes("/auth/register/start") ||
      url.includes("/auth/verify/email") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");

    //  Banned / forced logout
    if ((status === 401 || status === 403) && message.includes("banned")) {
      forceLogout();
      throw error;
    }

    //  Try refresh ONCE for protected APIs
    if (
      status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers ??= {};
        (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    throw error;
  }
);

/* ============================================================
   AUTO REFRESH INTERVAL
============================================================ */

const REFRESH_INTERVAL_MS = 14 * 60 * 1000; // 14 min
let refreshIntervalId: ReturnType<typeof setInterval> | null = null;

if ("window" in globalThis && refreshIntervalId === null) {
  refreshIntervalId = globalThis.setInterval(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const newToken = await refreshAccessToken();
      if (!newToken && refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
      }
    } catch {
      // ignore
    }
  }, REFRESH_INTERVAL_MS);
}

export default api;
