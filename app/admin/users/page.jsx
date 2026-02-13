"use client";
import { useEffect, useState } from "react";
import PageShell from "../../../components/PageShell";
import { getUser } from "../../../lib/auth";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) return void (window.location.href = "/login");
    if (u.role !== "admin") return void (window.location.href = "/profile");
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/admin");
      setUsers(data.users || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function create(e) {
    e.preventDefault();
    try {
      await api.post("/api/users/admin", form);
      toast.success("User created");
      setForm({ name: "", email: "", phone: "", password: "", role: "user" });
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Create failed");
    }
  }

  async function toggle(id) {
    try {
      await api.patch(`/api/users/admin/${id}/toggle`);
      toast.success("Updated");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    }
  }

  return (
    <PageShell title="Admin — Users" kicker="PEOPLE">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">Create user</div>
          <form onSubmit={create} className="mt-4 space-y-3">
            <Field label="Name" value={form.name} onChange={(v)=>setForm(s=>({...s,name:v}))} />
            <Field label="Email" value={form.email} onChange={(v)=>setForm(s=>({...s,email:v}))} />
            <Field label="Phone" value={form.phone} onChange={(v)=>setForm(s=>({...s,phone:v}))} />
            <Field label="Password" type="password" value={form.password} onChange={(v)=>setForm(s=>({...s,password:v}))} />
            <label className="block">
              <div className="text-sm font-medium text-slate-700">Role</div>
              <select
                value={form.role}
                onChange={(e)=>setForm(s=>({...s,role:e.target.value}))}
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-soft hover:opacity-90 transition">
              Create
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/50 bg-white/45 p-4 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900 p-2">All users</div>
          {loading ? (
            <div className="text-sm text-slate-600 p-4">Loading…</div>
          ) : (
            <div className="divide-y divide-white/50">
              {users.map(u => (
                <div key={u._id || u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email} • {u.role} • {u.isActive ? "active" : "inactive"}</div>
                  </div>
                  <button onClick={() => toggle(u._id || u.id)} className="rounded-2xl bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-glass hover:bg-white transition">
                    Toggle
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, type="text", value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        required={label !== "Password (optional)"}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}
