import PageShell from "../../../components/PageShell";
import { Building2, Globe, ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import AdminBar from "./AdminBar";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

async function getCaseStudy(slug) {
  try {
    const res = await fetch(`${API_URL}/api/case-studies/${slug}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return data?.item || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  try {
    const cs = await getCaseStudy(params.slug);
    if (!cs) return { title: "Case Study — MySEO" };
    return {
      title: cs.metaTitle || `${cs.title} — MySEO`,
      description: cs.metaDescription || "",
      alternates: { canonical: `/casestudy/${cs.slug}` },
      openGraph: {
        title: cs.metaTitle || cs.title,
        description: cs.metaDescription || "",
        type: "article",
        images: cs.coverImage ? [{ url: cs.coverImage }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: cs.metaTitle || cs.title,
        description: cs.metaDescription || "",
        images: cs.coverImage ? [cs.coverImage] : [],
      },
    };
  } catch {
    return { title: "Case Study — MySEO" };
  }
}

export default async function CaseStudyDetailPage({ params }) {
  const cs = await getCaseStudy(params.slug);

  // ── Not found ──
  if (!cs) {
    return (
      <PageShell title="Not Found" kicker="CASE STUDY">
        <div className="text-center py-20 space-y-4">
          <p className="text-slate-500 text-sm">
            This case study doesn&quo;t exist or is no longer published.
          </p>
          <Link
            href="/casestudy"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-slate-800 transition"
          >
            ← Back to Case Studies
          </Link>
        </div>
      </PageShell>
    );
  }

  const publishedDate = cs.publishedAt
    ? new Date(cs.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <PageShell title={cs.title} kicker={cs.industry || "CASE STUDY"}>
      {/*
        Admins see an amber banner with CMS links while
        Regular users see nothing
      */}
      <AdminBar slug={cs.slug} />

      <div className="max-w-5xl mx-auto">
        {/* Cover image */}
        {cs.coverImage && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-white/50 shadow-xl">
            <img
              src={cs.coverImage}
              alt={cs.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        {/* Body: content + sidebar */}
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Main content — renders the Jodit HTML from the CMS */}
          <div className="lg:col-span-3">
            <div
              className={[
                "prose prose-slate max-w-none",
                "prose-headings:font-semibold prose-headings:text-slate-900",
                "prose-p:text-slate-600 prose-p:leading-relaxed",
                "prose-a:text-slate-900 prose-a:font-semibold prose-a:underline",
                "prose-strong:text-slate-900",
                "prose-ul:text-slate-600 prose-ol:text-slate-600",
                "prose-li:marker:text-slate-400",
                "prose-img:rounded-2xl prose-img:shadow-glass",
                "prose-table:rounded-xl prose-table:overflow-hidden",
                "prose-th:bg-slate-100 prose-th:text-slate-700",
                "prose-blockquote:border-slate-900 prose-blockquote:text-slate-700",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: cs.content }}
            />
          </div>

          {/* Sticky sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">
            {/* Project details card */}
            <div className="rounded-3xl border border-white/60 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                Project Details
              </h4>

              <div className="space-y-3">
                {cs.client && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-0.5">
                      <Building2 className="h-3 w-3" /> Client
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {cs.client}
                    </p>
                  </div>
                )}

                {cs.industry && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-0.5">
                      <Globe className="h-3 w-3" /> Industry
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {cs.industry}
                    </p>
                  </div>
                )}

                {publishedDate && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-0.5">
                      <CalendarDays className="h-3 w-3" /> Published
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {publishedDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <Link
              href="/casestudy"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/65 transition backdrop-blur"
            >
              ← All Case Studies
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-soft hover:bg-slate-800 transition"
            >
              Start a Project <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </aside>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-3xl bg-slate-900 p-8 text-white text-center shadow-xl">
          <div className="text-base font-semibold">
            Ready to write your own success story?
          </div>
          <p className="mt-2 text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Let&quo;s build a strategy across search, local, and AI-powered platforms.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition shadow-soft"
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
