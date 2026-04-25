"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "../../../lib/auth";
import { Pencil, LayoutDashboard } from "lucide-react";

export default function AdminBar({ slug }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u?.role === "admin") setIsAdmin(true);
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-5 py-3 shadow-glass backdrop-blur">
      <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
        Admin Preview
      </span>
      <div className="ml-auto flex flex-wrap gap-2">
        <Link
          href="/admin/casestudy"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/90 transition"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          CMS Dashboard
        </Link>
        <Link
          href="/admin/casestudy"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:bg-slate-800 transition"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit This Study
        </Link>
      </div>
    </div>
  );
}
