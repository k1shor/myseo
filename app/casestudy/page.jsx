import Link from "next/link";
import PageShell from "../../components/PageShell";
import { ArrowRight, Building2, Calendar } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

async function getCaseStudies() {
  try {
    const res = await fetch(`${API_URL}/api/case-studies`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return [];
    return data?.items || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Work & Case Studies — MySEO",
  description:
    "Real results from real clients. Explore how MySEO helped businesses grow with SEO, Local SEO, and AI-powered search optimization.",
};

export default async function WorkPage() {
  const items = await getCaseStudies();

  return (
    <PageShell title="Case Studies" kicker="OUR WORK">
      {/* Intro */}
      <p className="text-slate-600 max-w-2xl leading-relaxed">
        Real strategies, measurable outcomes. Here&apos;s how we&apos;ve helped businesses rank, grow, and win visibility across traditional search and AI-powered platforms.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-white/50 bg-white/45 p-10 shadow-soft backdrop-blur-xl text-center">
          <div className="text-slate-500 text-sm">
            Case studies coming soon. Check back shortly.
          </div>
        </div>
      ) : (
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((cs) => (
            <CaseStudyCard key={cs._id} cs={cs} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-14 rounded-3xl bg-slate-900 p-8 md:p-10 text-white text-center shadow-xl">
        <div className="text-lg font-semibold">
          Ready to be the next success story?
        </div>
        <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto">
          Let&apos;s build a strategy tailored to your goals — search engines, local maps, and AI platforms.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition shadow-soft"
        >
          Start a Conversation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </PageShell>
  );
}

function CaseStudyCard({ cs }) {
  return (
    <Link
      href={`/casestudy/${cs.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/45 shadow-soft backdrop-blur-xl hover:-translate-y-1 transition flex flex-col"
    >
      {/* Cover image */}
      <div className="h-44 bg-gradient-to-br from-pink-200/60 via-violet-200/60 to-sky-200/60 overflow-hidden">
        {cs.coverImage ? (
          <img
            src={cs.coverImage}
            alt={cs.title}
            className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-4xl opacity-20">📈</div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
          {cs.title}
        </h3>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {cs.client && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {cs.client}
            </span>
          )}
          {cs.industry && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {cs.industry}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-1 text-xs font-semibold text-slate-900 group-hover:gap-2 transition-all">
          Read case study <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
