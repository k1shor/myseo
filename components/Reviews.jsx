"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

// const REVIEWS_DATA = [
//   {
//     id: "r1",
//     name: "Aarav Shrestha",
//     rating: 5,
//     text: "Super smooth experience end-to-end. Communication was clear, delivery was fast, and the final output looked premium.",
//     url: "https://example.com/aarav",
//   },
//   {
//     id: "r2",
//     name: "Binisha Maharjan",
//     rating: 4.5,
//     text: "Very professional and responsive. The UI/UX improvements noticeably boosted engagement. Highly recommended.",
//     url: "https://example.com/binisha",
//   },
//   {
//     id: "r3",
//     name: "Suman Adhikari",
//     rating: 4,
//     text: "Great support and clean code. Minor revisions were handled quickly and the project stayed on schedule.",
//     url: "https://example.com/suman",
//   },
//   {
//     id: "r4",
//     name: "Nisha Karki",
//     rating: 5,
//     text: "Excellent quality, modern design, and solid performance. The team was proactive with suggestions too.",
//     url: "https://example.com/nisha",
//   },
// ];


function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function StarRating({ rating = 0 }) {
    const safe = clamp(Number(rating) || 0, 0, 5);
    const full = Math.floor(safe);
    const half = safe - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return (
        <div className="flex items-center gap-1 text-lg text-emerald-500">
            {Array.from({ length: full }).map((_, i) => (
                <span key={`f-${i}`}>★</span>
            ))}
            {half && (
                <span className="relative">
                    <span className="opacity-30">★</span>
                    <span className="absolute inset-0 overflow-hidden w-1/2">★</span>
                </span>
            )}
            {Array.from({ length: empty }).map((_, i) => (
                <span key={`e-${i}`} className="opacity-30">
                    ★
                </span>
            ))}
        </div>
    );
}

function ReviewCard({ review }) {


    return (
        <article className="h-full flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">

            {/* TEXT */}
            <p className="text-slate-700 leading-relaxed text-lg">
                “{review.text}”
            </p>

            {/* FOOTER */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900 tracking-tight">
                        {review.clientName}
                    </h3>

                    {review.url && (
                        <a
                            href={review.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            {new URL(review.url).hostname}
                        </a>
                    )}
                </div>

                <StarRating rating={review.rating} />
            </div>
        </article>
    );
}

const Reviews = () => {
    const [index, setIndex] = useState(0);
    const [perView, setPerView] = useState(3);
    const intervalRef = useRef(null);
    
    
    const [REVIEWS_DATA, setReviews] = useState([])
    
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`)
        .then((response) => response.json())
        .then(data => {
            console.log(data.items)
            setReviews(data.items)})
    }, [])
    
    const reviews = useMemo(() => REVIEWS_DATA, []);
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

    useEffect(() => {
        intervalRef.current = setInterval(next, 4000);
        return () => clearInterval(intervalRef.current);
    }, [maxIndex]);

    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="mx-auto max-w-6xl px-4">

                {/* HEADER */}
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <p className="text-sm font-semibold tracking-widest text-emerald-600 uppercase">
                        Testimonials
                    </p>
                    <h2 className="mt-2 text-4xl font-bold text-slate-900">
                        What Clients Say
                    </h2>
                    <p className="mt-3 text-slate-600">
                        Authentic feedback from real collaborations and successful projects.
                    </p>
                </div>

                {/* CAROUSEL */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${(index * 100) / perView}%)` }}
                    >
                        {REVIEWS_DATA?.map((r) => (
                            <div
                                key={r.id}
                                className="shrink-0 p-3"
                                style={{ width: `${100 / perView}%` }}
                            >
                                <ReviewCard review={r} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="flex justify-center gap-4 mt-10">
                    <button
                        onClick={prev}
                        className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow transition"
                    >
                        Prev
                    </button>
                    <button
                        onClick={next}
                        className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow transition"
                    >
                        Next
                    </button>
                </div>

            </div>
        </section>
    );
};

export default Reviews;