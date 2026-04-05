const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.clearmindpdf.com";

export interface QuotaInfo {
  plan: string;
  daily_limit: number;
  used_today: number;
  remaining: number;
}

const CLIENT_ID_KEY = "clearmind_client_id";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

export async function fetchQuota(): Promise<QuotaInfo> {
  const clientId = getClientId();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  try {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/quota?client_id=${encodeURIComponent(clientId)}`,
      { headers }
    );

    if (!response.ok) {
      return { plan: "ANONYMOUS", daily_limit: 1, used_today: 0, remaining: 1 };
    }

    return await response.json();
  } catch {
    return { plan: "ANONYMOUS", daily_limit: 1, used_today: 0, remaining: 1 };
  }
}
