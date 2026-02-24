"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "../../../components/PageShell";
import GlassCard from "../../../components/GlassCard";
import { adminGetAbout, adminSaveAbout } from "../../../lib/adminApi";

function join(...xs) {
  return xs.filter(Boolean).join(" ");
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <input
        className={join(
          "mt-1 w-full rounded-2xl border border-white/60 bg-white/55",
          "px-4 py-2 text-sm text-slate-900 outline-none",
          "shadow-glass backdrop-blur",
          "focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
        )}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <textarea
        rows={rows}
        className={join(
          "mt-1 w-full rounded-2xl border border-white/60 bg-white/55",
          "px-4 py-2 text-sm text-slate-900 outline-none",
          "shadow-glass backdrop-blur",
          "focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
        )}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-glass backdrop-blur">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={join(
          "relative h-7 w-12 rounded-full border border-white/60 transition",
          checked ? "bg-slate-900" : "bg-white/60"
        )}
        aria-pressed={checked}
      >
        <span
          className={join(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow",
            "transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

function IconButton({ children, onClick, title, variant = "ghost" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition";
  const styles =
    variant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-500"
      : variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : "border border-white/60 bg-white/45 text-slate-800 hover:bg-white/60 shadow-glass backdrop-blur";
  return (
    <button type="button" onClick={onClick} title={title} className={join(base, styles)}>
      {children}
    </button>
  );
}

function ensureDoc(doc) {
  // Default structure so form never breaks
  return {
    isPublished: true,
    meta: {
      title: "",
      description: "",
      keywords: "",
      canonical: "/about",
      og: { title: "", description: "", image: "", type: "website" },
      twitter: {
        card: "summary_large_image",
        title: "",
        description: "",
        image: ""
      }
    },
    page: { title: "About", kicker: "OUR STORY" },
    content: {
      heroBadges: { badgeText: "", name: "" },
      intro: { lead: "", emphasisA: "", mid: "", emphasisB: "", tail: "" },
      stats: [
        { label: "Jobs Completed", value: "60+" },
        { label: "Job Success", value: "100%" }
      ],
      featureCards: [
        { title: "SEO-first architecture", desc: "Metadata, OG, keywords, clean slugs, and speed." },
        { title: "Conversion-focused content", desc: "Authority + clarity + compelling offers." }
      ],
      founder: {
        heading: "Message from the Founder",
        quote:
          "“Marketing shouldn’t feel noisy. It should feel inevitable. When your site is structured correctly, the right people find you — and they trust you faster.”",
        sign: "— Founder, MySEO"
      },
      whatYouGet: {
        heading: "What you get",
        items: [
          "Strategy, not guesswork",
          "Premium visuals + premium structure",
          "SEO fields controlled from Admin CMS",
          "Reporting-ready content & campaigns"
        ]
      }
    },
    ...(doc || {})
  };
}

function setDeep(obj, path, value) {
  const keys = path.split(".");
  const clone = structuredClone(obj);
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

export default function DashboardAboutPage() {
  const [doc, setDoc] = useState(() => ensureDoc(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      setOkMsg("");
      try {
        const loaded = await adminGetAbout();
        if (!alive) return;
        setDoc(ensureDoc(loaded));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load");
        // keep defaults so you can still save first time
        setDoc((prev) => ensureDoc(prev));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const metaPreview = useMemo(() => {
    const m = doc.meta || {};
    return {
      title: m.title || "(no title)",
      description: m.description || "(no description)",
      canonical: m.canonical || "/about",
      ogImage: m.og?.image || "(no OG image)",
      twitterImage: m.twitter?.image || "(no Twitter image)"
    };
  }, [doc]);

  async function onSave() {
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      // Send only the fields expected by backend
      const payload = {
        isPublished: !!doc.isPublished,
        meta: doc.meta,
        page: doc.page,
        content: doc.content
      };
      const saved = await adminSaveAbout(payload);
      setDoc(ensureDoc(saved));
      setOkMsg("✅ Saved successfully");
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function update(path, value) {
    setDoc((prev) => setDeep(prev, path, value));
  }

  function addStat() {
    setDoc((prev) => {
      const next = structuredClone(prev);
      next.content.stats = Array.isArray(next.content.stats) ? next.content.stats : [];
      next.content.stats.push({ label: "", value: "" });
      return next;
    });
  }

  function removeStat(idx) {
    setDoc((prev) => {
      const next = structuredClone(prev);
      next.content.stats = (next.content.stats || []).filter((_, i) => i !== idx);
      return next;
    });
  }

  function addFeatureCard() {
    setDoc((prev) => {
      const next = structuredClone(prev);
      next.content.featureCards = Array.isArray(next.content.featureCards) ? next.content.featureCards : [];
      next.content.featureCards.push({ title: "", desc: "" });
      return next;
    });
  }

  function removeFeatureCard(idx) {
    setDoc((prev) => {
      const next = structuredClone(prev);
      next.content.featureCards = (next.content.featureCards || []).filter((_, i) => i !== idx);
      return next;
    });
  }

  function addWhatYouGetItem() {
    setDoc((prev) => {
      const next = structuredClone(prev);
      next.content.whatYouGet.items = Array.isArray(next.content.whatYouGet.items)
        ? next.content.whatYouGet.items
        : [];
      next.content.whatYouGet.items.push("");
      return next;
    });
  }

  function removeWhatYouGetItem(idx) {
    setDoc((prev) => {
      const next = structuredClone(prev);
      next.content.whatYouGet.items = (next.content.whatYouGet.items || []).filter((_, i) => i !== idx);
      return next;
    });
  }

  if (loading) {
    return (
      <PageShell title="About CMS" kicker="DASHBOARD">
        <GlassCard>
          <div className="text-sm text-slate-700">Loading…</div>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="About CMS" kicker="DASHBOARD">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {err ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
              {err}
            </div>
          ) : null}
          {okMsg ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700">
              {okMsg}
            </div>
          ) : null}

          <Toggle
            label={doc.isPublished ? "Published ✅" : "Draft (Not Published)"}
            checked={!!doc.isPublished}
            onChange={(v) => update("isPublished", v)}
          />

          {/* META */}
          <GlassCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Meta / SEO</div>
                <div className="mt-1 text-xs text-slate-600">Controls metadata, OG, and Twitter cards.</div>
              </div>
              <IconButton variant="primary" onClick={onSave}>
                {saving ? "Saving..." : "Save Changes"}
              </IconButton>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <TextInput
                label="Meta Title"
                value={doc.meta?.title}
                onChange={(v) => update("meta.title", v)}
                placeholder="About — MySEO"
              />
              <TextInput
                label="Canonical Path"
                value={doc.meta?.canonical}
                onChange={(v) => update("meta.canonical", v)}
                placeholder="/about"
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Meta Description"
                  value={doc.meta?.description}
                  onChange={(v) => update("meta.description", v)}
                  placeholder="Short description for SEO…"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="Keywords (comma separated)"
                  value={doc.meta?.keywords}
                  onChange={(v) => update("meta.keywords", v)}
                  placeholder="seo, local seo, geo, ai seo…"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <TextInput
                label="OG Title"
                value={doc.meta?.og?.title}
                onChange={(v) => update("meta.og.title", v)}
              />
              <TextInput
                label="OG Type"
                value={doc.meta?.og?.type}
                onChange={(v) => update("meta.og.type", v)}
                placeholder="website"
              />
              <div className="md:col-span-2">
                <TextArea
                  label="OG Description"
                  value={doc.meta?.og?.description}
                  onChange={(v) => update("meta.og.description", v)}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <TextInput
                  label="OG Image URL"
                  value={doc.meta?.og?.image}
                  onChange={(v) => update("meta.og.image", v)}
                  placeholder="/og/about.jpg or https://..."
                />
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <TextInput
                label="Twitter Card"
                value={doc.meta?.twitter?.card}
                onChange={(v) => update("meta.twitter.card", v)}
                placeholder="summary_large_image"
              />
              <TextInput
                label="Twitter Title"
                value={doc.meta?.twitter?.title}
                onChange={(v) => update("meta.twitter.title", v)}
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Twitter Description"
                  value={doc.meta?.twitter?.description}
                  onChange={(v) => update("meta.twitter.description", v)}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <TextInput
                  label="Twitter Image URL"
                  value={doc.meta?.twitter?.image}
                  onChange={(v) => update("meta.twitter.image", v)}
                />
              </div>
            </div>
          </GlassCard>

          {/* PAGE */}
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Page Header</div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <TextInput
                label="Page Title"
                value={doc.page?.title}
                onChange={(v) => update("page.title", v)}
                placeholder="About"
              />
              <TextInput
                label="Kicker"
                value={doc.page?.kicker}
                onChange={(v) => update("page.kicker", v)}
                placeholder="OUR STORY"
              />
            </div>
          </GlassCard>

          {/* HERO BADGES */}
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Hero Badges (optional)</div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <TextInput
                label="Badge Text"
                value={doc.content?.heroBadges?.badgeText}
                onChange={(v) => update("content.heroBadges.badgeText", v)}
                placeholder="SEO Freelancer • GEO / LLM SEO"
              />
              <TextInput
                label="Name"
                value={doc.content?.heroBadges?.name}
                onChange={(v) => update("content.heroBadges.name", v)}
                placeholder="Hemanta Maharjan"
              />
            </div>
          </GlassCard>

          {/* INTRO */}
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Intro Sentence Builder</div>
            <div className="mt-4 space-y-4">
              <TextArea
                label="Lead (before emphasis)"
                value={doc.content?.intro?.lead}
                onChange={(v) => update("content.intro.lead", v)}
                rows={2}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="Emphasis A"
                  value={doc.content?.intro?.emphasisA}
                  onChange={(v) => update("content.intro.emphasisA", v)}
                />
                <TextInput
                  label="Middle text"
                  value={doc.content?.intro?.mid}
                  onChange={(v) => update("content.intro.mid", v)}
                />
                <TextInput
                  label="Emphasis B"
                  value={doc.content?.intro?.emphasisB}
                  onChange={(v) => update("content.intro.emphasisB", v)}
                />
                <TextInput
                  label="Tail"
                  value={doc.content?.intro?.tail}
                  onChange={(v) => update("content.intro.tail", v)}
                />
              </div>
            </div>
          </GlassCard>

          {/* STATS */}
          <GlassCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Stats</div>
                <div className="mt-1 text-xs text-slate-600">E.g. Jobs Completed, Job Success</div>
              </div>
              <IconButton onClick={addStat}>+ Add</IconButton>
            </div>

            <div className="mt-4 space-y-3">
              {(doc.content?.stats || []).map((s, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-glass backdrop-blur"
                >
                  <div className="md:col-span-2">
                    <TextInput
                      label="Label"
                      value={s.label}
                      onChange={(v) => {
                        const next = structuredClone(doc);
                        next.content.stats[idx].label = v;
                        setDoc(next);
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextInput
                      label="Value"
                      value={s.value}
                      onChange={(v) => {
                        const next = structuredClone(doc);
                        next.content.stats[idx].value = v;
                        setDoc(next);
                      }}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-end">
                    <IconButton variant="danger" onClick={() => removeStat(idx)}>
                      Remove
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* FEATURE CARDS */}
          <GlassCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Feature Cards</div>
                <div className="mt-1 text-xs text-slate-600">The two cards in your About page.</div>
              </div>
              <IconButton onClick={addFeatureCard}>+ Add</IconButton>
            </div>

            <div className="mt-4 space-y-3">
              {(doc.content?.featureCards || []).map((c, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-glass backdrop-blur"
                >
                  <div className="grid md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <TextInput
                        label="Title"
                        value={c.title}
                        onChange={(v) => {
                          const next = structuredClone(doc);
                          next.content.featureCards[idx].title = v;
                          setDoc(next);
                        }}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <TextInput
                        label="Description"
                        value={c.desc}
                        onChange={(v) => {
                          const next = structuredClone(doc);
                          next.content.featureCards[idx].desc = v;
                          setDoc(next);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <IconButton variant="danger" onClick={() => removeFeatureCard(idx)}>
                      Remove
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* FOUNDER */}
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Founder Message</div>
            <div className="mt-4 space-y-4">
              <TextInput
                label="Heading"
                value={doc.content?.founder?.heading}
                onChange={(v) => update("content.founder.heading", v)}
              />
              <TextArea
                label="Quote"
                value={doc.content?.founder?.quote}
                onChange={(v) => update("content.founder.quote", v)}
                rows={4}
              />
              <TextInput
                label="Signature"
                value={doc.content?.founder?.sign}
                onChange={(v) => update("content.founder.sign", v)}
              />
            </div>
          </GlassCard>

          {/* WHAT YOU GET */}
          <GlassCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">What you get</div>
                <div className="mt-1 text-xs text-slate-600">Bullets on the right panel.</div>
              </div>
              <IconButton onClick={addWhatYouGetItem}>+ Add item</IconButton>
            </div>

            <div className="mt-4 space-y-4">
              <TextInput
                label="Heading"
                value={doc.content?.whatYouGet?.heading}
                onChange={(v) => update("content.whatYouGet.heading", v)}
              />

              <div className="space-y-3">
                {(doc.content?.whatYouGet?.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/45 p-3 shadow-glass backdrop-blur"
                  >
                    <input
                      className="w-full rounded-xl border border-white/60 bg-white/55 px-3 py-2 text-sm text-slate-900 outline-none"
                      value={it}
                      onChange={(e) => {
                        const next = structuredClone(doc);
                        next.content.whatYouGet.items[idx] = e.target.value;
                        setDoc(next);
                      }}
                      placeholder="Bullet text..."
                    />
                    <IconButton variant="danger" onClick={() => removeWhatYouGetItem(idx)}>
                      Remove
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Bottom Save */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={join(
                "rounded-2xl px-5 py-3 text-sm font-semibold transition",
                "bg-slate-900 text-white shadow-soft hover:bg-slate-800",
                saving ? "opacity-60 cursor-not-allowed" : ""
              )}
            >
              {saving ? "Saving..." : "Save About Section"}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Meta Preview</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>
                <span className="text-xs text-slate-500">Title:</span>{" "}
                <span className="font-semibold text-slate-900">{metaPreview.title}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Description:</span>{" "}
                {metaPreview.description}
              </div>
              <div>
                <span className="text-xs text-slate-500">Canonical:</span>{" "}
                {metaPreview.canonical}
              </div>
              <div>
                <span className="text-xs text-slate-500">OG Image:</span>{" "}
                {metaPreview.ogImage}
              </div>
              <div>
                <span className="text-xs text-slate-500">Twitter Image:</span>{" "}
                {metaPreview.twitterImage}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Quick Content Preview</div>
            <div className="mt-3">
              <div className="text-xs text-slate-500">Page</div>
              <div className="text-sm font-semibold text-slate-900">
                {doc.page?.title} <span className="text-slate-500">({doc.page?.kicker})</span>
              </div>

              <div className="mt-4 text-xs text-slate-500">Intro</div>
              <div className="mt-1 text-sm text-slate-700 leading-relaxed">
                {doc.content?.intro?.lead}
                <span className="font-semibold text-slate-900">{doc.content?.intro?.emphasisA}</span>
                {doc.content?.intro?.mid}
                <span className="font-semibold text-slate-900">{doc.content?.intro?.emphasisB}</span>
                {doc.content?.intro?.tail}
              </div>

              <div className="mt-4 text-xs text-slate-500">What you get</div>
              <ul className="mt-1 space-y-1 text-sm text-slate-700">
                {(doc.content?.whatYouGet?.items || []).slice(0, 6).map((x, i) => (
                  <li key={i}>• {x}</li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-pink-200/35 via-violet-200/35 to-sky-200/35 p-6 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">Tip</div>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              If you don’t see data loading, confirm your admin token exists in{" "}
              <span className="font-semibold">localStorage(token)</span> and your
              <span className="font-semibold"> NEXT_PUBLIC_API_URL</span> points to the backend.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}