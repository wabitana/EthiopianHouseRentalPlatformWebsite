const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  body?: any;
}

// Module-level refresh promise to prevent race conditions
// (multiple parallel requests all expiring at once only triggers ONE refresh call)
let refreshPromise: Promise<string | null> | null = null;

/**
 * Silently refreshes the access token using the HttpOnly refresh token cookie.
 * Returns the new access token string, or null if refresh failed.
 */
async function silentRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include", // Sends the HttpOnly delala_refresh_token cookie automatically
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newToken = data.token;

      if (newToken && typeof window !== "undefined") {
        // Update the JS-readable access token cookie
        document.cookie = `delala_token=${newToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
      }

      return newToken ?? null;
    } catch {
      return null;
    } finally {
      // Allow future refresh calls after this one resolves
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Clears auth state and redirects to portal login.
 */
function forceLogout() {
  if (typeof window !== "undefined") {
    document.cookie = "delala_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    // Note: delala_refresh_token is HttpOnly and will be cleared by the backend on the next refresh attempt
    window.location.href = "/portal/login";
  }
}

/**
 * Core fetch wrapper. Automatically attaches the access token and silently
 * refreshes it on 401 before retrying the original request once.
 */
export async function apiFetch(path: string, options: ApiRequestInit = {}) {
  // Resolve current access token from JS-readable cookie
  const getToken = () => {
    if (typeof window === "undefined") return "";
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("delala_token="))
        ?.split("=")[1] ?? ""
    );
  };

  const buildHeaders = (token: string): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  });

  const serializeBody = (body: any) => {
    if (body && typeof body === "object" && !(body instanceof Blob) && !(body instanceof FormData)) {
      return JSON.stringify(body);
    }
    return body;
  };

  const doFetch = (token: string) =>
    fetch(`${BACKEND_URL}${path}`, {
      ...options,
      body: serializeBody(options.body),
      headers: buildHeaders(token),
      credentials: "include", // Always send cookies for CORS requests
    });

  // --- First attempt ---
  let response = await doFetch(getToken());

  // --- On 401 Unauthorized: try silent token refresh, then retry once ---
  if (response.status === 401) {
    const newToken = await silentRefresh();

    if (newToken) {
      // Retry original request with refreshed token
      response = await doFetch(newToken);
    }

    // If refresh failed or retry still 401'd, force logout
    if (response.status === 401) {
      forceLogout();
      let errorMsg = `API error: ${response.status} ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData?.error) errorMsg = errData.error;
      } catch { /* ignore */ }
      throw new Error(errorMsg);
    }
  }

  // On 403 Forbidden or other non-OK status: throw error without forceLogout
  if (!response.ok) {
    let errorMsg = `API error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData?.error) errorMsg = errData.error;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
