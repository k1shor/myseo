import axios from "axios";

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

API.interceptors.request.use((config) => {
    try {
        const auth = JSON.parse(localStorage.getItem("pp_auth"));
        if (auth?.token) {
            config.headers.Authorization = `Bearer ${auth.token}`;
        }
    } catch { }
    return config;
});

/* PUBLIC */
export async function getTools() {
    const { data } = await API.get("/api/tools");
    return data;
}

/* ADMIN */
export async function createTool(payload) {
    const { data } = await API.post("/api/tools", payload);
    return data;
}

export async function updateTool(id, payload) {
    const { data } = await API.put(`/api/tools/${id}`, payload);
    return data;
}

export async function deleteTool(id) {
    const { data } = await API.delete(`/api/tools/${id}`);
    return data;
}

export async function reorderTools(payload) {
    const { data } = await API.put("/api/tools/reorder", payload);
    return data;
}

export async function uploadToolImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await API.post("/api/tools/upload", formData);
    return data;
}