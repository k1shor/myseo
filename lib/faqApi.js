import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  withCredentials: true,
});


API.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem("myseo_auth_v1"));
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  } catch {}
  return config;
});

/* --- PUBLIC --- */

export async function getPublicFaqs() {
  const { data } = await API.get("/api/faqs");
  return data; 
}

/* --- ADMIN --- */

export async function getAdminFaqs() {
  const { data } = await API.get("/api/faqs/admin");
  return data; 
}

export async function createFaq(payload) {
  const { data } = await API.post("/api/faqs", payload);
  return data;
}

export async function updateFaq(id, payload) {
  const { data } = await API.put(`/api/faqs/${id}`, payload);
  return data;
}

export async function deleteFaq(id) {
  const { data } = await API.delete(`/api/faqs/${id}`);
  return data;
}

export async function reorderFaqs(items) {
  const { data } = await API.put("/api/faqs/reorder", { items });
  return data;
}
