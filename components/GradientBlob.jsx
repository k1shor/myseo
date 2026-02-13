"use client";
import { motion } from "framer-motion";

export default function GradientBlob({ className="" }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute -z-10 blur-3xl opacity-70 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.75, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div className="h-72 w-72 rounded-full bg-gradient-to-tr from-pink-300 via-violet-300 to-sky-300" />
    </motion.div>
  );
}
