import { api } from "./api";

export const CaseStudyAPI = {
  // ─── PUBLIC ────────────────────────────────

  getPublicAll: async () => {
    const { data } = await api.get("/api/case-studies");
    return data;
  },

  getPublicBySlug: async (slug) => {
    const { data } = await api.get(`/api/case-studies/${slug}`);
    return data;
  },

  // ─── ADMIN ─────────────────────────────────

  adminGetAll: async () => {
    const { data } = await api.get("/api/case-studies/admin");
    return data;
  },

  adminGetById: async (id) => {
    const { data } = await api.get(`/api/case-studies/admin/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/api/case-studies/admin", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/api/case-studies/admin/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/api/case-studies/admin/${id}`);
    return data;
  },
};
