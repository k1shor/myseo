const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
import { getAuthToken } from "./auth";


export async function adminGetAbout() {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/api/admin/about`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    cache: "no-store"
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || "Failed to load about";
    throw new Error(msg);
  }

  return data?.item || null;
}

export async function adminSaveAbout(payload) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/api/admin/about`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || "Failed to save about";
    throw new Error(msg);
  }

  return data?.item || null;
}