import PageShell from "../../components/PageShell";
import GlassCard from "../../components/GlassCard";

/**
 * ✅ API base
 * Set in .env.local:
 * NEXT_PUBLIC_API_URL=http://localhost:5000
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

/**
 * ✅ Fallback content (used if API fails or returns null)
 * Keep this so the page never breaks.
 */
const FALLBACK_ABOUT = {
  meta: {
    title: "About — MySEO",
    description:
      "Learn about the marketing mind behind MySEO and the philosophy of SEO-first elegance.",
    keywords:
      "MySEO, SEO freelancer, search engine optimization, local SEO, GEO, generative engine optimization, AI SEO, LLM SEO, Google AI Overviews",
    canonical: "/about",
    og: {
      title: "About — MySEO",
      description:
        "SEO-first elegance with measurable performance. Built for brands that want visibility on search + AI answer engines.",
      image: "/og/about.jpg",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "About — MySEO",
      description:
        "SEO-first elegance with measurable performance. Search + Local + AI SEO (GEO).",
      image: "/og/about.jpg"
    }
  },
  page: { title: "About", kicker: "OUR STORY" },
  content: {
    intro: {
      lead:
        "MySEO is a boutique digital marketing & SEO studio built for brands that want",
      emphasisA: " design-level elegance",
      mid: " with",
      emphasisB: " measurable performance",
      tail:
        ". We treat every page like a landing page — fast, structured, and crafted for intent."
    },
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
        "Reporting-ready content & campaigns",
        "Brand Discovery + Brand Visibility in AI-powered search engines"
      ]
    },
    stats: [
      { label: "Jobs Completed", value: "60+" },
      { label: "Job Success", value: "100%" }
    ],
    expertise: {
      heading: "Expertise",
      subtitle: "Search Engines • Local SEO • AI SEO / GEO",
      items: [
        { title: "SEO for Search Engines", desc: "Google • Bing • DuckDuckGo" },
        { title: "Local & National SEO", desc: "Google Maps • Bing Maps" },
        { title: "AI SEO / GEO (LLM SEO)", desc: "ChatGPT • Gemini • Perplexity • AIO" }
      ]
    }
  },
  isPublished: true
};

function join(...xs) {
  return xs.filter(Boolean).join(" ");
}

function ensureAbout(doc) {
  // Merge doc on top of fallback while keeping nested defaults.
  // (Avoids crashing if some fields are missing.)
  const d = doc || {};
  return {
    ...FALLBACK_ABOUT,
    ...d,
    meta: { ...FALLBACK_ABOUT.meta, ...(d.meta || {}) },
    page: { ...FALLBACK_ABOUT.page, ...(d.page || {}) },
    content: {
      ...FALLBACK_ABOUT.content,
      ...(d.content || {}),
      intro: { ...FALLBACK_ABOUT.content.intro, ...(d.content?.intro || {}) },
      founder: { ...FALLBACK_ABOUT.content.founder, ...(d.content?.founder || {}) },
      whatYouGet: {
        ...FALLBACK_ABOUT.content.whatYouGet,
        ...(d.content?.whatYouGet || {}),
        items: Array.isArray(d.content?.whatYouGet?.items)
          ? d.content.whatYouGet.items
          : FALLBACK_ABOUT.content.whatYouGet.items
      },
      featureCards: Array.isArray(d.content?.featureCards)
        ? d.content.featureCards
        : FALLBACK_ABOUT.content.featureCards,
      stats: Array.isArray(d.content?.stats)
        ? d.content.stats
        : FALLBACK_ABOUT.content.stats,
      expertise: {
        ...FALLBACK_ABOUT.content.expertise,
        ...(d.content?.expertise || {}),
        items: Array.isArray(d.content?.expertise?.items)
          ? d.content.expertise.items
          : FALLBACK_ABOUT.content.expertise.items
      }
    }
  };
}

/**
 * ✅ Fetch from backend (public endpoint)
 * GET /api/about -> { success: true, item: <doc|null> }
 */
async function fetchAboutFromApi() {
  try {
    const res = await fetch(`${API_URL}/api/about`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return data?.item || null;
  } catch {
    return null;
  }
}

/**
 * ✅ Dynamic metadata using backend data
 * Next.js App Router supports async generateMetadata
 */
export async function generateMetadata() {
  const doc = await fetchAboutFromApi();
  const about = ensureAbout(doc);
  const m = about.meta || {};

  return {
    title: m.title || FALLBACK_ABOUT.meta.title,
    description: m.description || FALLBACK_ABOUT.meta.description,
    keywords: m.keywords || FALLBACK_ABOUT.meta.keywords,
    alternates: { canonical: m.canonical || "/about" },
    openGraph: {
      title: m.og?.title || m.title || FALLBACK_ABOUT.meta.og.title,
      description: m.og?.description || m.description || FALLBACK_ABOUT.meta.og.description,
      url: m.canonical || "/about",
      type: m.og?.type || "website",
      images: [m.og?.image || FALLBACK_ABOUT.meta.og.image]
    },
    twitter: {
      card: m.twitter?.card || "summary_large_image",
      title: m.twitter?.title || m.title || FALLBACK_ABOUT.meta.twitter.title,
      description:
        m.twitter?.description || m.description || FALLBACK_ABOUT.meta.twitter.description,
      images: [m.twitter?.image || FALLBACK_ABOUT.meta.twitter.image]
    }
  };
}

export default async function AboutPage() {
  const doc = await fetchAboutFromApi();
  const ABOUT = ensureAbout(doc);

  const { page, content } = ABOUT;

  // If not published, you can choose to show fallback or hide.
  // Here we show fallback if doc exists but isPublished=false.
  // If you want to hide completely, return 404 or a message instead.
  const isPublished = doc ? !!doc.isPublished : true;
  const show = isPublished ? ABOUT : FALLBACK_ABOUT;

  const p = show.page;
  const c = show.content;

  return (
    <PageShell title={p.title} kicker={p.kicker}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Main */}
        <div className="lg:col-span-2">
          <GlassCard>
            <p className="text-slate-700 leading-relaxed">
              {c.intro.lead}
              <span className="font-semibold text-slate-900">{c.intro.emphasisA}</span>
              {c.intro.mid}
              <span className="font-semibold text-slate-900">{c.intro.emphasisB}</span>
              {c.intro.tail}
            </p>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              {(c.featureCards || []).map((card, idx) => (
                <div
                  key={`${card.title || "card"}-${idx}`}
                  className="rounded-2xl bg-white/55 p-4 shadow-glass border border-white/40 backdrop-blur"
                >
                  <div className="text-sm font-semibold text-slate-900">{card.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{card.desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Expertise block (glassy) */}
          <div className="mt-6">
            <GlassCard>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {c.expertise?.heading || "Expertise"}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {c.expertise?.subtitle || "Search Engines • Local SEO • AI SEO / GEO"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/40 px-3 py-1 text-xs text-slate-700 shadow-glass backdrop-blur">
                  {Array.isArray(c.stats) && c.stats.length >= 2
                    ? `${c.stats[0].value} ${c.stats[0].label} • ${c.stats[1].value} ${c.stats[1].label}`
                    : "60+ Jobs • 100% Success"}
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {(c.expertise?.items || []).slice(0, 3).map((it, idx) => (
                  <div
                    key={`${it.title || "expertise"}-${idx}`}
                    className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-glass backdrop-blur"
                  >
                    <div className="text-xs font-semibold text-slate-900">{it.title}</div>
                    <div className="mt-1 text-xs text-slate-600">{it.desc}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right: Founder + What you get */}
        <div>
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">{c.founder.heading}</div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{c.founder.quote}</p>
            <div className="mt-4 text-xs text-slate-500">{c.founder.sign}</div>
          </GlassCard>

          <div className="mt-6 rounded-3xl border border-white/50 bg-gradient-to-br from-pink-200/40 via-violet-200/40 to-sky-200/40 p-6 shadow-soft backdrop-blur">
            <div className="text-sm font-semibold text-slate-900">{c.whatYouGet.heading}</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(c.whatYouGet.items || []).map((item, idx) => (
                <li key={`${item}-${idx}`}>• {item}</li>
              ))}
            </ul>

            {/* Micro CTA */}
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="/contact"
                className={join(
                  "inline-flex items-center justify-center rounded-2xl",
                  "bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-soft",
                  "hover:bg-slate-800 transition"
                )}
              >
                Book a Free Call
              </a>
              <a
                href="/work"
                className={join(
                  "inline-flex items-center justify-center rounded-2xl",
                  "border border-white/60 bg-white/40 px-4 py-2 text-xs font-semibold",
                  "text-slate-800 shadow-glass hover:bg-white/55 transition backdrop-blur"
                )}
              >
                View Case Studies
              </a>
            </div>
          </div>

          {!isPublished ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-700">
              Note: About content is currently not published. Showing fallback content.
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}