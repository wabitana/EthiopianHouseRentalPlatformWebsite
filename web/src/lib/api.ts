const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  body?: any;
}

export async function apiFetch(path: string, options: ApiRequestInit = {}) {
  let token = "";
  if (typeof window !== "undefined") {
    token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("delala_token="))
      ?.split("=")[1] || "";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof Blob) && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    body,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) errorMsg = errData.error;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
