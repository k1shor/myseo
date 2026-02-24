"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, User2 } from "lucide-react";
import { getUser, logout } from "../lib/auth";
import GradientBlob from "./GradientBlob";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/blogs", label: "Blogs" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/45 backdrop-blur-xl ">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-sky-300 via-violet-300 to-pink-300 shadow-soft" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-slate-900">MySEO</div>
            <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">SEO • Marketing • Content</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/55 px-2 py-1 shadow-glass">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-3 py-2 text-sm transition ${
                  active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-pink-200/70 via-violet-200/70 to-sky-200/70"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => router.push("/profile")}
                className="hidden sm:flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-sm text-slate-700 shadow-glass hover:bg-white/70 transition"
              >
                <User2 className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>
              {user.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="hidden sm:flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-sm text-slate-700 shadow-glass hover:bg-white/70 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </button>
              )}
              <button
                onClick={() => { logout(); router.push("/"); router.refresh(); }}
                className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm text-white shadow-soft hover:opacity-90 transition"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full bg-white/55 px-4 py-2 text-sm shadow-glass hover:bg-white/70 transition">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-soft hover:opacity-90 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden border-t border-white/40">
        <div className="mx-auto max-w-6xl px-4 py-2 flex gap-2 overflow-x-auto">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-sm ${
                  active ? "bg-slate-900 text-white" : "bg-white/60 text-slate-700"
                } shadow-glass`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
