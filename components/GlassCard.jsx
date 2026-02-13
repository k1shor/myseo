"use client";
import { motion } from "framer-motion";

export default function GlassCard({ children, className="" }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
