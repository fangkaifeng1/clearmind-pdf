// Authentication utility functions

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.clearmindpdf.com";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Get stored token
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// Save token
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

// Remove token
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

// Check if authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Get current user info
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error("Failed to get user info:", error);
    return null;
  }
}

// Logout
export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  removeToken();
}

// Redirect to Google login
export function loginWithGoogle(): void {
  window.location.href = `${BACKEND_URL}/api/auth/google`;
}

// Authenticated fetch wrapper
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Add client_id header for quota tracking
  const clientId = typeof window !== "undefined"
    ? localStorage.getItem("clearmind_client_id") || ""
    : "";
  if (clientId) {
    headers.set("X-Client-ID", clientId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401, clear token
  if (response.status === 401) {
    removeToken();
  }

  return response;
}
