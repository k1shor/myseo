"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function buildApiUrl(path) {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function StarRating({ rating = 0 }) {
  const safe = clamp(Number(rating) || 0, 0, 5);

  // Render 5 stars with a fill overlay per-star (0..1)
  const fills = Array.from({ length: 5 }).map((_, i) =>
    clamp(safe - i, 0, 1)
  );

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${safe} out of 5`}>
      {fills.map((fill, i) => (
        <span key={i} className="relative inline-grid place-items-center">
          <Star className="h-4 w-4 text-slate-300" />
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fill * 100}%` }}
          >
            <Star className="h-4 w-4 text-emerald-500" />
          </span>
        </span>
      ))}
      <span className="ml-2 text-xs font-semibold text-slate-700">
        {safe.toFixed(safe % 1 === 0 ? 0 : 1)}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-full rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
      <div className="h-4 w-24 rounded-full bg-white/70" />
      <div className="mt-5 space-y-3">
        <div className="h-3 w-full rounded-full bg-white/60" />
        <div className="h-3 w-[92%] rounded-full bg-white/60" />
        <div className="h-3 w-[78%] rounded-full bg-white/60" />
      </div>
      <div className="mt-6 h-px bg-white/60" />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="h-3 w-28 rounded-full bg-white/60" />
          <div className="mt-2 h-3 w-20 rounded-full bg-white/50" />
        </div>
        <div className="h-4 w-24 rounded-full bg-white/50" />
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const host = review?.clientUrl ? safeHost(review.clientUrl) : "";

  return (
    <article
      className={[
        "group h-full rounded-3xl border border-white/50 bg-white/45 p-7",
        "shadow-md shadow-purple-100/50 backdrop-blur-xl overflow-hidden",
        "hover:-translate-y-1 transition hover:shadow-purple-200/70 ",
      ].join(" ")}
    >
      {/* gradient wash */}
      <div className="pointer-events-none absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl bg-gradient-to-br from-pink-200/30 via-violet-200/30 to-sky-200/30" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-semibold text-slate-800 shadow-glass backdrop-blur">
            <Quote className="h-3.5 w-3.5" />

          </div>
          <StarRating rating={review?.rating} />
        </div>

        <p className="mt-5 text-slate-700 leading-relaxed text-[15px]">
          <span className="text-slate-400">“</span>
          {review?.text || ""}
          <span className="text-slate-400">”</span>
        </p>

        <div className="mt-auto pt-5">
          <div className="h-px bg-white/60" />
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                {review?.clientName || "Anonymous"}
              </h3>

              {review?.clientUrl ? (
                <a
                  href={review.clientUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {host || review.clientUrl}
                  <span className="text-slate-400">↗</span>
                </a>
              ) : (
                <div className="mt-1 text-xs text-slate-500">Client</div>
              )}
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/50 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-glass backdrop-blur">
              Verified
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Reviews() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  const intervalRef = useRef(null);

  const reviews = useMemo(() => items || [], [items]);

  // Fetch
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(buildApiUrl("/api/reviews"), { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        const list = data?.items || data?.item || [];

        if (!alive) return;

        // ✅ show only published reviews
        const published = Array.isArray(list)
          ? list.filter((r) => r?.isPublished === true)
          : [];

        setItems(published);
        setStatus("ready");
      } catch {
        if (!alive) return;
        setItems([]);
        setStatus("error");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Responsive perView
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 768) return 1;
      if (w < 1024) return 2;
      return 3;
    };
    const update = () => setPerView(calc());
    update();

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, reviews.length - perView);

  const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));

  // Autoplay
  useEffect(() => {
    if (!reviews.length) return;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 4500);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxIndex, perView, reviews.length]);

  // Keep index valid if list changes
  useEffect(() => {
    setIndex((i) => clamp(i, 0, maxIndex));
  }, [maxIndex]);

  const showControls = reviews.length > perView;

  return (
    <section className="relative mt-12">


      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-soft">
              <SparkleDot />
              Testimonials
            </div>

            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              What clients say
            </h2>
            <p className="mt-2 text-slate-600">
              Real feedback from real collaborations — designed to rank and convert.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {showControls ? (
              <>
                <NavButton onClick={prev} title="Previous">
                  <ArrowLeft className="h-4 w-4" />
                </NavButton>
                <NavButton onClick={next} title="Next">
                  <ArrowRight className="h-4 w-4" />
                </NavButton>
              </>
            ) : null}

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm shadow-glass hover:bg-white/75 transition backdrop-blur"
            >
              Work with me <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Slider */}
        <div className="mt-8 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${(index * 100) / perView}%)` }}
          >
            {status === "loading"
              ? Array.from({ length: perView }).map((_, i) => (
                <div key={i} className="shrink-0 p-3" style={{ width: `${100 / perView}%` }}>
                  <SkeletonCard />
                </div>
              ))
              : reviews.map((r, i) => (
                <div
                  key={r?._id || r?.id || `review-${i}`}
                  className="shrink-0 p-3"
                  style={{ width: `${100 / perView}%` }}
                >
                  <ReviewCard review={r} />
                </div>
              ))}
          </div>
        </div>

        {/* Dots */}
        {showControls ? (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={[
                  "h-2.5 rounded-full transition",
                  i === index ? "w-8 bg-slate-900" : "w-2.5 bg-slate-900/20 hover:bg-slate-900/30"
                ].join(" ")}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        ) : null}

        {/* Empty state */}
        {status === "ready" && reviews.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
            <div className="text-sm font-semibold text-slate-900">No reviews yet</div>
            <p className="mt-2 text-sm text-slate-600">
              Add testimonials from the Admin panel, then they’ll appear here automatically.
            </p>
          </div>
        ) : null}

        {/* Error */}
        {status === "error" ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-sm text-rose-700">
            Failed to load testimonials. Please try again later.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NavButton({ onClick, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "inline-flex items-center justify-center rounded-full",
        "border border-white/60 bg-white/60 px-3 py-2",
        "shadow-glass hover:bg-white/75 transition backdrop-blur"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SparkleDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
    </span>
  );
}