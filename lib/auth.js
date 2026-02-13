const KEY = "myseo_auth_v1";

export function setAuthSession({ token, user }) {
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days
  localStorage.setItem(KEY, JSON.stringify({ token, user, expiresAt }));
}

export function getAuthSession() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data?.token || !data?.expiresAt) return null;
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function getAuthToken() {
  const s = getAuthSession();
  return s?.token || null;
}

export function getUser() {
  const s = getAuthSession();
  return s?.user || null;
}

export function logout() {
  localStorage.removeItem(KEY);
}
