import Link from "next/link";

export default function Footer({ settings }) {
  const social = settings?.social || {};
  const contact = settings?.contact || {};

  const links = [
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/blogs", label: "Blogs" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="mt-16 border-t border-white/40 bg-white/35 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="text-lg font-semibold text-slate-900">{settings?.siteName || "MySEO"}</div>
          <p className="mt-2 text-sm text-slate-600">
            {settings?.siteTagline || "Digital Marketing & SEO Specialist"} — elegant strategies, measurable results.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-medium text-slate-800">Email:</span> {contact.email || "admin@myseo.com"}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">Phone:</span> {contact.phone || "+977-98XXXXXXXX"}
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Explore</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="rounded-full bg-white/55 px-3 py-2 text-sm text-slate-700 shadow-glass hover:bg-white/70 transition">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Social</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(social).filter(([,v]) => v).map(([k,v]) => (
              <a key={k} href={v} target="_blank" rel="noreferrer" className="rounded-full bg-white/55 px-3 py-2 text-sm text-slate-700 shadow-glass hover:bg-white/70 transition">
                {k}
              </a>
            ))}
            {Object.entries(social).every(([,v]) => !v) && (
              <div className="text-sm text-slate-600">Add social links in Admin → Settings.</div>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500">© {new Date().getFullYear()} MySEO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
