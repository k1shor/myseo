import axios from "axios";

// base axios instance (reuse if you already have one)
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true
});

// 🔐 attach token if exists
API.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem("pp_auth"));
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  } catch {}
  return config;
});

/* =========================
   PUBLIC
========================= */

export async function getPublicReviews() {
  const { data } = await API.get("/api/reviews/public");
  return data;
}

/* =========================
   ADMIN CRUD
========================= */

export async function getReviews(params = {}) {
  const { data } = await API.get("/api/reviews", { params });
  return data;
}

export async function getReviewById(id) {
  const { data } = await API.get(`/api/reviews/${id}`);
  return data;
}

export async function createReview(payload) {
  const { data } = await API.post("/api/reviews", payload);
  return data;
}

export async function updateReview(id, payload) {
  const { data } = await API.put(`/api/reviews/${id}`, payload);
  return data;
}

export async function deleteReview(id) {
  const { data } = await API.delete(`/api/reviews/${id}`);
  return data;
}