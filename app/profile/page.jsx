"use client";
import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { getUser, logout } from "../../lib/auth";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      window.location.href = "/login";
      return;
    }
    setUser(u);
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/users/me/messages");
        setMessages(data.items || []);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageShell title="Profile" kicker="ACCOUNT">
      {user && (
        <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-900">{user.name}</div>
              <div className="text-sm text-slate-600">{user.email}</div>
              <div className="mt-1 text-xs text-slate-500">Role: {user.role}</div>
            </div>

            <div className="flex gap-2">
              {user.role === "admin" && (
                <Link href="/admin" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white shadow-soft hover:opacity-90 transition">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="rounded-2xl bg-white/70 px-4 py-2 text-sm text-slate-800 shadow-glass hover:bg-white/85 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
        <div className="text-sm font-semibold text-slate-900">Your contact messages</div>
        <p className="mt-1 text-sm text-slate-600">Admin replies appear inside each message.</p>

        {loading ? (
          <div className="mt-4 text-sm text-slate-600">Loading…</div>
        ) : messages.length ? (
          <div className="mt-4 space-y-4">
            {messages.map(m => (
              <div key={m._id} className="rounded-2xl bg-white/60 p-4 shadow-glass">
                <div className="text-sm font-medium text-slate-900">{m.subject}</div>
                <div className="mt-1 text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()} • Status: {m.status}</div>
                <div className="mt-3 text-sm text-slate-700 whitespace-pre-line">{m.message}</div>

                {m.replies?.length ? (
                  <div className="mt-4 space-y-3">
                    <div className="text-xs font-semibold text-slate-900">Replies</div>
                    {m.replies.map((r, idx) => (
                      <div key={idx} className="rounded-2xl bg-white/70 p-3 shadow-glass">
                        <div className="text-xs text-slate-500">{new Date(r.repliedAt).toLocaleString()}</div>
                        <div className="mt-1 text-sm text-slate-700 whitespace-pre-line">{r.replyText}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-slate-600">No reply yet.</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-600">No messages yet. Use the Contact page to message the admin.</div>
        )}
      </div>
    </PageShell>
  );
}
