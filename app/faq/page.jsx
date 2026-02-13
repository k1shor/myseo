import PageShell from "../../components/PageShell";
import GlassCard from "../../components/GlassCard";

export const metadata = {
  title: "FAQ — MySEO",
  description: "Answers to common questions about SEO, content strategy, and digital marketing."
};

const faqs = [
  { q: "How long does SEO take to show results?", a: "Typically 6–12 weeks for meaningful signals, and 3–6 months for strong compounding gains. It depends on competition and site quality." },
  { q: "Do you guarantee rankings?", a: "No one can honestly guarantee a #1 rank. We guarantee a rigorous process: audits, intent research, content systems, and technical quality improvements." },
  { q: "Do you handle content writing?", a: "Yes. We write SEO-first content designed to rank and convert, based on keyword intent and your brand voice." },
  { q: "Can I change packages later?", a: "Absolutely. Upgrade, downgrade, or switch to a custom plan at any time." },
  { q: "Is this website SEO-ready?", a: "Yes. Admin controls SEO defaults and each blog has meta fields, keywords, OG image support, clean slugs, and fast rendering." },
];

export default function FAQPage() {
  return (
    <PageShell title="FAQ" kicker="QUESTIONS">
      <div className="grid gap-4">
        {faqs.map(f => (
          <GlassCard key={f.q}>
            <div className="text-sm font-semibold text-slate-900">{f.q}</div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.a}</p>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
