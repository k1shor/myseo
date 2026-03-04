"use client";

import { useEffect, useRef, useState } from "react";
import { getTools } from "../lib/toolsApi";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ToolsSection() {
  const [tools, setTools] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    getTools().then((res) => setTools(res?.items || []));
  }, []);

  function scroll(direction) {
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -width * 0.85 : width * 0.85,
      behavior: "smooth"
    });
  }

  if (!tools.length) return null;

  return (
    <section className="relative mt-20 overflow-hidden">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
            My stack
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Tools & Platforms
          </h2>
        </div>

        <div className="flex gap-2 ">
          <button
            onClick={() => scroll("left")}
            className="rounded-full bg-white/60 p-2 shadow-glass hover:bg-white/80 transition backdrop-blur"
          >
            <ArrowLeft className="h-4 w-4 text-slate-800" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full bg-white/60 p-2 shadow-glass hover:bg-white/80 transition backdrop-blur"
          >
            <ArrowRight className="h-4 w-4 text-slate-800" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />

        <div
          ref={scrollRef}
          className="flex gap-16 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth pb-6 scrollbar-hide pt-20"
        >
          {tools.map((tool, idx) => (
            <motion.div
              key={tool._id}
              className="min-w-[260px] snap-start flex-shrink-0 flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              {/* ICON */}
              <motion.div
                whileHover={{ y: -8, rotate: -1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition bg-gradient-to-br from-pink-200/50 via-violet-200/50 to-sky-200/50" />

                <img
                  src={tool.image}
                  alt={tool.name}
                  title = {tool.description}
                  className="relative h-32 w-32 object-contain drop-shadow-[0_25px_45px_rgba(2,6,23,0.25)] transition-transform duration-300 group-hover:scale-110"
                  draggable={false}
                />
              </motion.div>

              {/* TITLE with Effects */}
              <motion.h3
                whileHover={{ scale: 1.05 }}
                className="
                  mt-6 text-lg font-semibold tracking-tight
                  bg-gradient-to-r from-pink-300 via-violet-500 to-sky-400
                  bg-clip-text text-transparent
                  transition-all duration-300
                "
              >
                {tool.name}
              </motion.h3>

              {/* Animated underline */}
              <div className="mt-3 h-[2px] w-0 bg-gradient-to-r from-pink-300 via-violet-400 to-sky-400 transition-all duration-300 group-hover:w-16" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}