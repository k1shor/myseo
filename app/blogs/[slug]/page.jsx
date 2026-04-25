import Link from "next/link";
import PageShell from "../../../components/PageShell";
import { api } from "../../../lib/api";

async function getBlog(slug) {
  const { data } = await api.get(`/api/blogs/slug/${slug}`);
  return data;
}
async function getArchive() {
  const { data } = await api.get(`/api/blogs/archive/recent?take=10`);
  return data.items || [];
}

export async function generateMetadata({ params }) {
  try {
    const blog = await getBlog(params.slug);
    const title = blog.metaTitle || blog.title;
    const description =
      blog.metaDescription || blog.excerpt || "Read the full article on MySEO.";
    const keywords = blog.keywords?.length ? blog.keywords : undefined;
    const ogImage = blog.ogImage || blog.coverImage || undefined;

    return {
      title: `${title} — MySEO`,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: "article",
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
    };
  } catch {
    return { title: "Blog — MySEO" };
  }
}

export default async function BlogDetails({ params }) {
  try {
    const blog = await getBlog(params.slug);
    const archive = await getArchive();
  } catch (error) {
    return (
      <PageShell title="BLOG POST" kicker="ARTICLE">
        <div className="grid lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {blog.title}
            </h2>

            <div className="mt-2 text-sm text-slate-500">
              {new Date(
                blog.publishedAt || blog.createdAt
              ).toLocaleDateString()}{" "}
              • By {blog.authorName}
            </div>

            {blog.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="mt-6 w-full max-h-[360px] object-cover rounded-3xl border border-white/60 shadow-glass"
              />
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {(blog.keywords || []).map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-white/60 px-3 py-1 text-xs text-slate-700 shadow-glass"
                >
                  {k}
                </span>
              ))}
            </div>

            <div className="prose prose-slate mt-6 max-w-none">
              {/* content is stored as HTML string for simplicity */}
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </article>

          <aside className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl h-fit">
            <div className="text-sm font-semibold text-slate-900">Archive</div>
            <div className="mt-4 space-y-3">
              {archive.map((a) => (
                <Link
                  key={a.slug}
                  href={`/blogs/${a.slug}`}
                  className="group flex gap-3 rounded-2xl bg-white/55 p-3 shadow-glass hover:bg-white/70 transition"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-200/60 via-violet-200/60 to-sky-200/60 overflow-hidden flex-shrink-0">
                    {a.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="h-12 w-12 object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 line-clamp-2">
                      {a.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(a.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </PageShell>
    );
  }
}
