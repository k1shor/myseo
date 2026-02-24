"use client";
import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import { getUser } from "../../lib/auth";
import GradientBlob from "../../components/GradientBlob";

export default function ContactPage() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/seo");
        setSettings(data);
        const u = getUser();
        if (u?.email) setForm((s) => ({ ...s, email: u.email }));
        if (u?.phone) setForm((s) => ({ ...s, phone: u.phone }));
      } catch { }
    })();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    try {
      const u = getUser();
      const endpoint = u ? "/api/messages/me" : "/api/messages";
      await api.post(endpoint, form);
      toast.success("Message sent ✨ You’ll see replies in your Profile.");
      setForm((s) => ({ ...s, subject: "", message: "" }));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const contact = settings?.contact || {};
  const social = settings?.social || {};

  return (
    <PageShell title="Contact" kicker="LET'S TALK">
      <GradientBlob className="left-[360px] top-[440px]" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">Send a message</div>
          <p className="mt-1 text-sm text-slate-600">Fill everything — faster replies happen with clear context.</p>

          <form onSubmit={submit} className="mt-5 grid md:grid-cols-2 gap-4">
            <Field label="Email" required value={form.email} onChange={(v) => setForm(s => ({ ...s, email: v }))} />
            <Field label="Phone" required value={form.phone} onChange={(v) => setForm(s => ({ ...s, phone: v }))} />
            <div className="md:col-span-2">
              <Field label="Subject" required value={form.subject} onChange={(v) => setForm(s => ({ ...s, subject: v }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm(s => ({ ...s, message: e.target.value }))}
                rows={6}
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Tell us what you want to achieve…"
              />
            </div>

            <button
              disabled={sending}
              className="md:col-span-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send message"}
            </button>

            <div className="md:col-span-2 text-xs text-slate-500">
              Replies are stored in your Profile. If you’re not logged in, you can still send a message, but you won’t see replies on the site.
            </div>
          </form>
        </div>

        <aside className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl h-fit">
          <div className="text-sm font-semibold text-slate-900">Contact info</div>
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            <div><span className="font-medium text-slate-800">Address:</span> {contact.address || "Set in Admin → Settings"}</div>
            <div><span className="font-medium text-slate-800">Email:</span> {contact.email || "hello@myseo.com"}</div>
            <div><span className="font-medium text-slate-800">Phone:</span> {contact.phone || "+977-98XXXXXXXX"}</div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-900">Social</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(social).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="rounded-full bg-white/60 px-3 py-2 text-sm text-slate-700 shadow-glass hover:bg-white/75 transition">
                  {k}
                </a>
              ))}
              {Object.entries(social).every(([, v]) => !v) && <div className="text-sm text-slate-600">Add links in Admin.</div>}
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-900 mt-6">Find Us Here</div>

          {contact.mapEmbedUrl ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/60 shadow-glass">
              <iframe title="map" src={contact.mapEmbedUrl} className="h-64 w-full" loading="lazy" />
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}

function Field({ label, required, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}
