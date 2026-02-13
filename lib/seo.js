import { api } from "./api";

let cached = null;
export async function getSiteSettings() {
  if (cached) return cached;
  const { data } = await api.get("/api/seo");
  cached = data;
  return data;
}
