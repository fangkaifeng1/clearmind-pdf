// 认证工具函数

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://43.163.107.29:8000";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// 获取存储的token
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// 保存token
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

// 删除token
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return !!getToken();
}

// 获取当前用户信息
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
    console.error("获取用户信息失败:", error);
    return null;
  }
}

// 登出
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
      console.error("登出失败:", error);
    }
  }
  removeToken();
}

// 跳转到Google登录
export function loginWithGoogle(): void {
  window.location.href = `${BACKEND_URL}/api/auth/google`;
}

// 带认证的fetch封装
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 如果401，清除token
  if (response.status === 401) {
    removeToken();
  }

  return response;
}
