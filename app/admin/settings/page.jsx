"use client";
import { useEffect, useState } from "react";
import PageShell from "../../../components/PageShell";
import { getUser } from "../../../lib/auth";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState({
    siteName: "MySEO",
    siteTagline: "Digital Marketing & SEO Specialist",
    defaultMetaTitle: "MySEO — Digital Marketing & SEO",
    defaultMetaDescription: "Elegant SEO-first blog and services for brands that want measurable growth.",
    defaultKeywordsText: "seo, digital marketing, content strategy",
    social: {},
    contact: {}
  });

  useEffect(() => {
    const u = getUser();
    if (!u) return void (window.location.href = "/login");
    if (u.role !== "admin") return void (window.location.href = "/profile");
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/seo");
      setS({
        siteName: data.siteName || "MySEO",
        siteTagline: data.siteTagline || "",
        defaultMetaTitle: data.defaultMetaTitle || "",
        defaultMetaDescription: data.defaultMetaDescription || "",
        defaultKeywordsText: (data.defaultKeywords || []).join(", "),
        social: data.social || {},
        contact: data.contact || {}
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api.put("/api/seo", {
        siteName: s.siteName,
        siteTagline: s.siteTagline,
        defaultMetaTitle: s.defaultMetaTitle,
        defaultMetaDescription: s.defaultMetaDescription,
        defaultKeywords: s.defaultKeywordsText.split(",").map(x=>x.trim()).filter(Boolean),
        social: s.social,
        contact: s.contact
      });
      toast.success("Saved ✨");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Admin — Site Settings" kicker="SEO">
      {loading ? (
        <div className="text-sm text-slate-600">Loading…</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
            <div className="text-sm font-semibold text-slate-900">SEO Defaults</div>
            <div className="mt-4 space-y-3">
              <Field label="Site name" value={s.siteName} onChange={(v)=>setS(x=>({...x,siteName:v}))} />
              <Field label="Tagline" value={s.siteTagline} onChange={(v)=>setS(x=>({...x,siteTagline:v}))} />
              <Field label="Default meta title" value={s.defaultMetaTitle} onChange={(v)=>setS(x=>({...x,defaultMetaTitle:v}))} />
              <Field label="Default meta description" value={s.defaultMetaDescription} onChange={(v)=>setS(x=>({...x,defaultMetaDescription:v}))} />
              <Field label="Default keywords (comma-separated)" value={s.defaultKeywordsText} onChange={(v)=>setS(x=>({...x,defaultKeywordsText:v}))} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
              <div className="text-sm font-semibold text-slate-900">Contact</div>
              <div className="mt-4 space-y-3">
                <Field label="Address" value={s.contact.address || ""} onChange={(v)=>setS(x=>({...x,contact:{...x.contact,address:v}}))} />
                <Field label="Email" value={s.contact.email || ""} onChange={(v)=>setS(x=>({...x,contact:{...x.contact,email:v}}))} />
                <Field label="Phone" value={s.contact.phone || ""} onChange={(v)=>setS(x=>({...x,contact:{...x.contact,phone:v}}))} />
                <Field label="Map embed URL" value={s.contact.mapEmbedUrl || ""} onChange={(v)=>setS(x=>({...x,contact:{...x.contact,mapEmbedUrl:v}}))} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
              <div className="text-sm font-semibold text-slate-900">Social Links</div>
              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <Field label="Facebook" value={s.social.facebook || ""} onChange={(v)=>setS(x=>({...x,social:{...x.social,facebook:v}}))} />
                <Field label="Instagram" value={s.social.instagram || ""} onChange={(v)=>setS(x=>({...x,social:{...x.social,instagram:v}}))} />
                <Field label="LinkedIn" value={s.social.linkedin || ""} onChange={(v)=>setS(x=>({...x,social:{...x.social,linkedin:v}}))} />
                <Field label="TikTok" value={s.social.tiktok || ""} onChange={(v)=>setS(x=>({...x,social:{...x.social,tiktok:v}}))} />
                <Field label="YouTube" value={s.social.youtube || ""} onChange={(v)=>setS(x=>({...x,social:{...x.social,youtube:v}}))} />
                <Field label="X" value={s.social.x || ""} onChange={(v)=>setS(x=>({...x,social:{...x.social,x:v}}))} />
              </div>
            </div>

            <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition disabled:opacity-60">
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}
