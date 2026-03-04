import Link from "next/link";
import { ArrowRight, Sparkles, BarChart3, Search, PenTool } from "lucide-react";
import { api } from "../lib/api";
import GlassCard from "../components/GlassCard";
import GradientBlob from "../components/GradientBlob";
import { motion } from "framer-motion";
import Reviews from "../components/Reviews";
import ToolsSection from "../components/ToolsSection";

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
    <main className="relative ">
      <GradientBlob className="left-[-60px] top-[-40px]" />
      <GradientBlob className="right-[-0px] top-[60px]" />
      <GradientBlob className="left-[60px] top-[780px]" />
      <GradientBlob className="right-[60px] top-[1180px]" />
      <GradientBlob className="left-[100px] top-[1580px]" />
      <GradientBlob className="left-[760px] top-[2080px]" />
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-20">
        <div className="rounded-[2rem] border border-white/50 bg-white/45 p-10 shadow-soft backdrop-blur-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                <Sparkles className="h-4 w-4" />
                Delivering data-driven SEO growth
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                Dominate Search <br /><span className="bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">Own Visibility</span> —  <br />Win Everywhere.
              </h1>
              <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                I’m Hemanta Maharjan, an SEO Freelancer helping businesses rank on traditional search engines like Google, Bing, and DuckDuckGo, dominate local results on Google Maps, and gain visibility inside AI-powered search platforms like ChatGPT, Gemini, Perplexity, and Google’s AI Overviews through advanced LLM SEO (Generative Engine Optimization).
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
                  <StatCard title="Top Rated" value="Upwork Talent Badge" sub="" />
                  <StatCard title="Success Rate" value="65+" sub="Job Completed" />
                  <StatCard title="Result Oriented" value="100%" sub="Job Success" />
                  <StatCard title="Experienced" value="19000+" sub="Hours worked" />
                </div>
                <div className="mt-6 rounded-2xl bg-white/55 p-5 shadow-glass">
                  <div className="text-sm font-semibold text-slate-900">Bridging Traditional SEO with AI-Powered Search.
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    With over a decade of experience, I bridge traditional search optimization and emerging AI search ecosystems, delivering proven results across diverse industries.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-3xl bg-gradient-to-tr from-pink-300 via-violet-300 to-sky-300 blur-xl opacity-70" />
            </div>
          </div>
        </div>

        <section className="mt-10 grid lg:grid-cols-3 gap-6">
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">SEO for Search Engines ✨</div>
            <p className="mt-2 text-sm text-slate-600">Increase organic visibility, traffic, keyword ranking and conversions through strategic ranking on traditional search engines like Google, Bing, DuckDuckGo etc.</p>
          </GlassCard>
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Local and National SEO
              🧠</div>
            <p className="mt-2 text-sm text-slate-600">Drive geo-targeted traffic, local leads, and nationwide organic visibility depending on business model.</p>
          </GlassCard>
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">AI SEO - SEO for LLMs Platforms (AI- Powered Search Engines)
              ⚡</div>
            <p className="mt-2 text-sm text-slate-600">Optimize brand visibility inside AI-driven search systems such as ChatGPT, Google AI Overviews, Gemini, Perplexity, Microsoft Copilot etc.</p>
          </GlassCard>
        </section>
        <Reviews />

        {/* Tools Section */}
        <section className="mt-16">

          <ToolsSection />
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
