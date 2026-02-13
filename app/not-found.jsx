import Link from "next/link";
import PageShell from "../components/PageShell";

export default function NotFound() {
  return (
    <PageShell title="Page not found" kicker="404">
      <div className="text-sm text-slate-600">
        The page you’re looking for doesn’t exist.
      </div>
      <Link href="/" className="mt-6 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white shadow-soft hover:opacity-90 transition">
        Go home
      </Link>
    </PageShell>
  );
}
