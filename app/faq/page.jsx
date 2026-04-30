"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { Search, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getPublicFaqs } from "../../lib/faqApi";

function SkeletonItem() {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl">
      <div className="h-4 w-3/4 rounded-full bg-white/60 animate-pulse" />
    </div>
  );
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        const data = await getPublicFaqs();
        if (!alive) return;
        setFaqs(data?.items || []);
        setStatus("ready");
      } catch {
        if (!alive) return;
        setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell title="FAQ" kicker="QUESTIONS">
      <div className="max-w-3xl mx-auto">
        {/* Search bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(-1);
            }}
            className="w-full rounded-2xl border border-white/50 bg-white/45 p-4 pl-12 text-sm shadow-soft backdrop-blur-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition"
          />
        </div>

        {/* Loading skeletons */}
        {status === "loading" && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-sm text-rose-700">
            Failed to load FAQs. Please try again later.
          </div>
        )}

        {/* FAQ list */}
        {status === "ready" && (
          <div className="grid gap-3">
            {filtered.length > 0 ? (
              filtered.map((f, i) => (
                <div key={f._id || i} className="group">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                    className={`w-full text-left rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl transition-all ${
                      openIndex === i ? "ring-1 ring-slate-900/10" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {f.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-300 ${
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
                        {f.answer}
                      </div>
                    </div>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                {faqs.length === 0
                  ? "No FAQs published yet. Check back soon."
                  : `No results found for "${search}"`}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
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
