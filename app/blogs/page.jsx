"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";

export default function BlogsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (author) q.set("author", author);
      if (keyword) q.set("keyword", keyword);
      q.set("page", "1");
      q.set("limit", "24");

      const { data } = await api.get(`/api/blogs?${q.toString()}`);
      setItems(data.items || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <PageShell title="Blogs" kicker="INSIGHTS">
      <div className="rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl">
        <div className="grid md:grid-cols-3 gap-3">
          <Field icon={<Search className="h-4 w-4" />} value={search} setValue={setSearch} placeholder="Search title, keyword, author..." />
          <Field icon={<User className="h-4 w-4" />} value={author} setValue={setAuthor} placeholder="Filter by author" />
          <Field icon={<Search className="h-4 w-4" />} value={keyword} setValue={setKeyword} placeholder="Filter by keyword" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={load} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white shadow-soft hover:opacity-90 transition">
            Apply
          </button>
          <button
            onClick={() => { setSearch(""); setAuthor(""); setKeyword(""); setTimeout(load, 0); }}
            className="rounded-2xl bg-white/60 px-4 py-2 text-sm text-slate-800 shadow-glass hover:bg-white/75 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 9 }).map((_,i) => <SkeletonCard key={i} />)
        ) : items.length ? (
          items.map((b) => (
            <Link key={b._id} href={`/blogs/${b.slug}`} className="group rounded-3xl border border-white/50 bg-white/45 shadow-soft backdrop-blur-xl overflow-hidden hover:-translate-y-1 transition">
              <div className="h-40 bg-gradient-to-br from-pink-200/60 via-violet-200/60 to-sky-200/60">
                {b.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.coverImage} alt={b.title} className="h-40 w-full object-cover" />
                ) : null}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.publishedAt || b.createdAt).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{b.authorName}</span>
                </div>
                <div className="mt-2 font-semibold text-slate-900 line-clamp-2">{b.title}</div>
                <div className="mt-2 text-sm text-slate-600 line-clamp-3">{b.excerpt || ""}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(b.keywords || []).slice(0,3).map(k => (
                    <span key={k} className="rounded-full bg-white/60 px-3 py-1 text-xs text-slate-700 shadow-glass">{k}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-sm text-slate-600">No blogs found.</div>
        )}
      </div>
    </PageShell>
  );
}

function Field({ icon, value, setValue, placeholder }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 shadow-glass">
      <span className="text-slate-500">{icon}</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/45 shadow-soft backdrop-blur-xl overflow-hidden">
      <div className="h-40 bg-white/50 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-2/3 bg-white/60 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/60 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/60 rounded animate-pulse" />
      </div>
    </div>
  );
}
