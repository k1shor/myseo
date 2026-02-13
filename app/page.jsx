import Link from "next/link";
import { ArrowRight, Sparkles, BarChart3, Search, PenTool } from "lucide-react";
import { api } from "../lib/api";
import GlassCard from "../components/GlassCard";
import GradientBlob from "../components/GradientBlob";
import { motion } from "framer-motion";

async function getLatest() {
  try {
    const { data } = await api.get("/api/blogs?limit=6&page=1");
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const latest = await getLatest();

  return (
    <main className="relative">
      <GradientBlob className="left-[-60px] top-[-40px]" />
      <GradientBlob className="right-[-90px] top-[60px]" />
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="rounded-[2rem] border border-white/50 bg-white/45 p-10 shadow-soft backdrop-blur-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                <Sparkles className="h-4 w-4" />
                Pastel-growth marketing
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                Make your brand <span className="bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">unforgettable</span> — and searchable.
              </h1>
              <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                A premium, SEO-first blog + service site for digital marketers who want elegance *and* performance.
                Every page is built with clean structure, speed, and metadata that ranks.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/services" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-white shadow-soft hover:opacity-90 transition">
                  View Packages <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/blogs" className="inline-flex items-center gap-2 rounded-full bg-white/60 px-5 py-3 text-slate-800 shadow-glass hover:bg-white/75 transition">
                  Explore Blogs <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid sm:grid-cols-3 gap-3">
                <MiniBadge icon={<Search className="h-4 w-4" />} title="SEO Strategy" desc="Intent-led architecture." />
                <MiniBadge icon={<PenTool className="h-4 w-4" />} title="Content" desc="Authority + delight." />
                <MiniBadge icon={<BarChart3 className="h-4 w-4" />} title="Growth" desc="Trackable outcomes." />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/60 bg-gradient-to-br from-white/60 to-white/20 p-6 shadow-soft backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard title="Organic traffic" value="+218%" sub="90 days" />
                  <StatCard title="Keyword wins" value="+43" sub="Top 10" />
                  <StatCard title="Leads" value="+3.7x" sub="Conversion" />
                  <StatCard title="ROI" value="10.4x" sub="Avg campaigns" />
                </div>
                <div className="mt-6 rounded-2xl bg-white/55 p-5 shadow-glass">
                  <div className="text-sm font-semibold text-slate-900">Your site, tuned for ranking</div>
                  <p className="mt-1 text-sm text-slate-600">
                    Structured metadata, fast pages, clean URLs, and SEO fields managed from Admin CMS.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-3xl bg-gradient-to-tr from-pink-300 via-violet-300 to-sky-300 blur-xl opacity-70" />
            </div>
          </div>
        </div>

        <section className="mt-10 grid lg:grid-cols-3 gap-6">
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Elegant UI ✨</div>
            <p className="mt-2 text-sm text-slate-600">Soft pastel gradients, glass cards, and smooth transitions.</p>
          </GlassCard>
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">CMS-ready 🧠</div>
            <p className="mt-2 text-sm text-slate-600">Admin manages blogs, users, messages, and site SEO defaults.</p>
          </GlassCard>
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Real SEO ⚡</div>
            <p className="mt-2 text-sm text-slate-600">Per-blog metadata, keywords, OG images, and clean architecture.</p>
          </GlassCard>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Latest posts</h2>
              <p className="mt-1 text-slate-600">Fresh ideas designed to convert and rank.</p>
            </div>
            <Link href="/blogs" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm shadow-glass hover:bg-white/75 transition">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((b) => (
              <Link key={b._id} href={`/blogs/${b.slug}`} className="group rounded-3xl border border-white/50 bg-white/45 shadow-soft backdrop-blur-xl overflow-hidden hover:-translate-y-1 transition">
                <div className="h-40 bg-gradient-to-br from-pink-200/60 via-violet-200/60 to-sky-200/60">
                  {b.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.coverImage} alt={b.title} className="h-40 w-full object-cover" />
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="text-xs text-slate-500">{new Date(b.publishedAt || b.createdAt).toLocaleDateString()}</div>
                  <div className="mt-1 font-semibold text-slate-900 line-clamp-2">{b.title}</div>
                  <div className="mt-2 text-sm text-slate-600 line-clamp-2">{b.excerpt || "Read the full article →"}</div>
                  <div className="mt-4 text-xs text-slate-500">By {b.authorName}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function MiniBadge({ icon, title, desc }) {
  return (
    <div className="rounded-2xl bg-white/55 px-4 py-3 shadow-glass">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{icon}{title}</div>
      <div className="mt-1 text-xs text-slate-600">{desc}</div>
    </div>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-2xl bg-white/55 p-4 shadow-glass">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}
