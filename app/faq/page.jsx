"use client";
import { useState } from "react";
import PageShell from "../../components/PageShell";
import GlassCard from "../../components/GlassCard";
import { Search, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    q: "How long does SEO take to show results?",
    a: "Typically 6–12 weeks for meaningful signals, and 3–6 months for strong compounding gains. It depends on competition and site quality.",
  },
  {
    q: "Do you guarantee rankings?",
    a: "No one can honestly guarantee a #1 rank. We guarantee a rigorous process: audits, intent research, content systems, and technical quality improvements.",
  },
  {
    q: "Do you handle content writing?",
    a: "Yes. We write SEO-first content designed to rank and convert, based on keyword intent and your brand voice.",
  },
  {
    q: "Can I change packages later?",
    a: "Absolutely. Upgrade, downgrade, or switch to a custom plan at any time.",
  },
  {
    q: "Is this website SEO-ready?",
    a: "Yes. Admin controls SEO defaults and each blog has meta fields, keywords, OG image support, clean slugs, and fast rendering.",
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(0); // First one open by default

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell title="FAQ" kicker="QUESTIONS">
      <div className="max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/50 bg-white/45 p-4 pl-12 text-sm shadow-soft backdrop-blur-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition"
          />
        </div>

        {/* FAQ List */}
        <div className="grid gap-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((f, i) => (
              <div key={f.q} className="group">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  className={`w-full text-left rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl transition-all ${
                    openIndex === i ? "ring-1 ring-slate-900/10" : ""
                  }`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm font-semibold text-slate-900">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      openIndex === i
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden text-sm text-slate-600 leading-relaxed">
                      {f.a}
                    </div>
                  </div>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              No results found for &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 rounded-3xl bg-slate-900 p-8 text-center text-white shadow-xl">
          <h3 className="text-lg font-semibold">Still have questions?</h3>
          <p className="mt-2 text-sm text-slate-300">
            We&apos;re here to help you grow your digital presence.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 transition"
          >
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
