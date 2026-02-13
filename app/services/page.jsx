import PageShell from "../../components/PageShell";
import GlassCard from "../../components/GlassCard";
import Link from "next/link";

export const metadata = {
  title: "Services — MySEO",
  description: "Digital marketing packages designed for growth: Starter, Growth, and Authority."
};

const packages = [
  {
    name: "Starter Spark",
    price: "$199/mo",
    desc: "Perfect for new brands who want quick clarity and foundational SEO.",
    items: ["SEO audit + quick fixes", "4 content ideas/month", "Basic on-page optimization", "Monthly performance summary"]
  },
  {
    name: "Growth Engine",
    price: "$499/mo",
    desc: "A balanced package for consistent traffic + lead growth.",
    items: ["Keyword research (advanced)", "8 content pieces/month", "Technical SEO monitoring", "Conversion improvements", "Monthly strategy call"]
  },
  {
    name: "Authority Suite",
    price: "$999/mo",
    desc: "Full-funnel marketing for brands ready to dominate their niche.",
    items: ["Content cluster strategy", "12 content pieces/month", "Link-building plan (white-hat)", "Landing page optimization", "Weekly reporting & iteration"]
  }
];

export default function ServicesPage() {
  return (
    <PageShell title="Services" kicker="PACKAGES">
      <div className="grid lg:grid-cols-3 gap-6">
        {packages.map((p, idx) => (
          <GlassCard key={p.name} className={idx === 1 ? "ring-2 ring-slate-900/10" : ""}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">{p.name}</div>
              <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{p.price}</div>
            </div>
            <p className="mt-3 text-sm text-slate-600">{p.desc}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              {p.items.map(i => <li key={i}>• {i}</li>)}
            </ul>
            <Link href="/contact" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition">
              Get this package
            </Link>
          </GlassCard>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
        <div className="text-sm font-semibold text-slate-900">Custom plans</div>
        <p className="mt-1 text-sm text-slate-600">
          Need something tailored (ads, funnels, ecommerce SEO, local SEO)? Contact us and we’ll build a plan that fits.
        </p>
      </div>
    </PageShell>
  );
}
