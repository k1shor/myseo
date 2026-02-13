"use client";
import { useEffect, useState } from "react";
import PageShell from "../../../components/PageShell";
import { getUser } from "../../../lib/auth";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AdminMessages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) return void (window.location.href = "/login");
    if (u.role !== "admin") return void (window.location.href = "/profile");
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/messages/admin");
      setItems(data.items || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(id) {
    if (!replyText.trim()) return toast.error("Write a reply");
    try {
      await api.post(`/api/messages/admin/${id}/reply`, { replyText });
      toast.success("Reply sent ✨");
      setReplyingId(null);
      setReplyText("");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Reply failed");
    }
  }

  return (
    <PageShell title="Admin — Messages" kicker="INBOX">
      <div className="rounded-3xl border border-white/50 bg-white/45 p-4 shadow-soft backdrop-blur-xl">
        {loading ? (
          <div className="text-sm text-slate-600 p-4">Loading…</div>
        ) : items.length ? (
          <div className="space-y-4 p-2">
            {items.map(m => (
              <div key={m._id} className="rounded-3xl bg-white/60 p-5 shadow-glass">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{m.subject}</div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()} • {m.email} • {m.phone || "—"} • {m.status}</div>
                  </div>
                  <button
                    onClick={() => { setReplyingId(m._id); setReplyText(""); }}
                    className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-soft hover:opacity-90 transition"
                  >
                    Reply
                  </button>
                </div>
                <div className="mt-4 whitespace-pre-line text-sm text-slate-700">{m.message}</div>

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
                ) : null}

                {replyingId === m._id ? (
                  <div className="mt-4 rounded-2xl bg-white/70 p-4 shadow-glass">
                    <div className="text-sm font-semibold text-slate-900">Write reply</div>
                    <textarea
                      value={replyText}
                      onChange={(e)=>setReplyText(e.target.value)}
                      rows={5}
                      className="mt-2 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => sendReply(m._id)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white shadow-soft hover:opacity-90 transition">Send</button>
                      <button onClick={() => { setReplyingId(null); setReplyText(""); }} className="rounded-2xl bg-white/80 px-4 py-2 text-sm text-slate-800 shadow-glass hover:bg-white transition">Cancel</button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Reply is saved to DB. If SMTP is configured, it also emails the user.</div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-600 p-4">No messages yet.</div>
        )}
      </div>
    </PageShell>
  );
}
