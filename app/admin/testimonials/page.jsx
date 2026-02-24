"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "../../../components/PageShell";
import { getUser } from "../../../lib/auth";
import Link from "next/link";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} from "../../../lib/reviewsApi";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Stars({ value = 0 }) {
  const safe = clamp(Number(value) || 0, 0, 5);
  const full = Math.floor(safe);
  const half = safe - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f-${i}`}>★</span>
      ))}
      {half && (
        <span className="relative">
          <span className="opacity-25">★</span>
          <span className="absolute inset-0 overflow-hidden w-1/2">★</span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} className="opacity-25">
          ★
        </span>
      ))}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          "mt-2 w-full rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-sm",
          "text-slate-900 shadow-glass backdrop-blur outline-none",
          "focus:ring-2 focus:ring-slate-900/10"
        )}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          "mt-2 w-full rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-sm resize-none",
          "text-slate-900 shadow-glass backdrop-blur outline-none",
          "focus:ring-2 focus:ring-slate-900/10"
        )}
      />
    </label>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "mt-2 w-full rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-sm",
          "text-slate-900 shadow-glass backdrop-blur outline-none",
          "focus:ring-2 focus:ring-slate-900/10"
        )}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/50 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [totalPages, setTotalPages] = useState(1);

  const [publishedFilter, setPublishedFilter] = useState("all"); // all | true | false
  const [sort, setSort] = useState("-createdAt");

  const [toast, setToast] = useState(null);

  // create
  const [clientName, setClientName] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");
  const [isPublished, setIsPublished] = useState("true");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    clientName: "",
    clientUrl: "",
    rating: 5,
    text: "",
    isPublished: true
  });

  useEffect(() => {
    setMounted(true);

    const u = getUser();
    if (!u) {
      window.location.href = "/login";
      return;
    }
    if (u.role !== "admin") {
      window.location.href = "/profile";
      return;
    }
    setUser(u);
    setChecking(false);
  }, []);

  const queryParams = useMemo(() => {
    const params = { page, limit, sort };
    if (publishedFilter === "true") params.published = true;
    if (publishedFilter === "false") params.published = false;
    return params;
  }, [page, limit, sort, publishedFilter]);

  async function load() {
    setLoading(true);
    try {
      const data = await getReviews(queryParams);

      // Accept common API shapes:
      // { success, items, page, pages, total } OR { items, pagination }
      const list = data?.items || data?.data?.items || [];
      const pages = data?.pages || data?.pagination?.pages || data?.meta?.pages || 1;

      setItems(list);
      setTotalPages(Number(pages) || 1);
    } catch (e) {
      setToast({
        type: "err",
        msg:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load reviews."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mounted || checking) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, checking, queryParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  async function onCreate(e) {
    e.preventDefault();
    try {
      const payload = {
        clientName: clientName.trim(),
        clientUrl: clientUrl.trim(),
        rating: Number(rating),
        text: text.trim(),
        isPublished: isPublished === "true"
      };

      if (!payload.clientName || !payload.text) {
        setToast({ type: "err", msg: "Client name and review text are required." });
        return;
      }

      await createReview(payload);
      setToast({ type: "ok", msg: "Review created." });

      setClientName("");
      setClientUrl("");
      setRating("5");
      setText("");
      setIsPublished("true");

      setPage(1);
      await load();
    } catch (e2) {
      setToast({
        type: "err",
        msg:
          e2?.response?.data?.message ||
          e2?.message ||
          "Failed to create review."
      });
    }
  }

  function openEdit(item) {
    setEditId(item?._id || item?.id);
    setEditForm({
      clientName: item?.clientName || "",
      clientUrl: item?.clientUrl || "",
      rating: Number(item?.rating || 5),
      text: item?.text || "",
      isPublished: Boolean(item?.isPublished)
    });
    setEditOpen(true);
  }

  async function onSaveEdit() {
    try {
      if (!editId) return;

      const payload = {
        clientName: String(editForm.clientName || "").trim(),
        clientUrl: String(editForm.clientUrl || "").trim(),
        rating: Number(editForm.rating),
        text: String(editForm.text || "").trim(),
        isPublished: Boolean(editForm.isPublished)
      };

      if (!payload.clientName || !payload.text) {
        setToast({ type: "err", msg: "Client name and review text are required." });
        return;
      }

      await updateReview(editId, payload);
      setToast({ type: "ok", msg: "Review updated." });
      setEditOpen(false);
      await load();
    } catch (e) {
      setToast({
        type: "err",
        msg:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to update review."
      });
    }
  }

  async function onTogglePublish(item) {
    try {
      const id = item?._id || item?.id;
      await updateReview(id, { isPublished: !item?.isPublished });
      setToast({ type: "ok", msg: "Publish status updated." });
      await load();
    } catch (e) {
      setToast({
        type: "err",
        msg:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to update publish status."
      });
    }
  }

  async function onDelete(item) {
    const id = item?._id || item?.id;
    const ok = window.confirm("Delete this review? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteReview(id);
      setToast({ type: "ok", msg: "Review deleted." });
      await load();
    } catch (e) {
      setToast({
        type: "err",
        msg:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to delete review."
      });
    }
  }

  if (!mounted || checking) {
    return (
      <PageShell title="Reviews" kicker="CMS">
        <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">Loading…</div>
          <div className="mt-2 text-sm text-slate-600">Checking access permissions.</div>
        </div>
      </PageShell>
    );
  }

  if (!user) return null;

  return (
    <PageShell
      title="Reviews"
      kicker="CMS"
      subtitle="Manage homepage testimonials / reviews"
      actions={
        <Link
          href="/admin"
          className="rounded-2xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/65 transition backdrop-blur"
        >
          ← Dashboard
        </Link>
      }
    >
      {/* toast */}
      {toast ? (
        <div
          className={cx(
            "mb-4 rounded-2xl border px-4 py-3 text-sm shadow-glass backdrop-blur",
            toast.type === "ok"
              ? "border-emerald-200/60 bg-emerald-100/50 text-emerald-900"
              : "border-rose-200/60 bg-rose-100/50 text-rose-900"
          )}
        >
          {toast.msg}
        </div>
      ) : null}

      {/* create + filters */}
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl h-auto!">
          <div className="text-sm font-semibold text-slate-900">Create Review</div>
          <form onSubmit={onCreate} className="mt-4 space-y-3">
            <TextInput
              label="Client Name"
              value={clientName}
              onChange={setClientName}
              placeholder="e.g., Sarah Khan"
            />
            <TextInput
              label="Client URL (optional)"
              value={clientUrl}
              onChange={setClientUrl}
              placeholder="https://client.com"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Rating"
                value={rating}
                onChange={setRating}
                options={[
                  { label: "5 ★", value: "5" },
                  { label: "4 ★", value: "4" },
                  { label: "3 ★", value: "3" },
                  { label: "2 ★", value: "2" },
                  { label: "1 ★", value: "1" }
                ]}
              />
              <Select
                label="Published"
                value={isPublished}
                onChange={setIsPublished}
                options={[
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" }
                ]}
              />
            </div>
            <TextArea
              label="Review Text"
              className="resize-none!"
              value={text}
              onChange={setText}
              placeholder="Write the review....."
              rows={10}
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-slate-800 transition"
            >
              Add Review
            </button>
            <div className="text-[11px] text-slate-500">
              Tip: Keep reviews short, specific, and outcome-focused ✨
            </div>
          </form>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">All Reviews</div>
              <div className="mt-1 text-xs text-slate-600">
                Total: {items.length} (page {page} of {totalPages})
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto">
              <Select
                label="Published Filter"
                value={publishedFilter}
                onChange={(v) => {
                  setPage(1);
                  setPublishedFilter(v);
                }}
                options={[
                  { label: "All", value: "all" },
                  { label: "Published", value: "true" },
                  { label: "Unpublished", value: "false" }
                ]}
              />
              <Select
                label="Sort"
                value={sort}
                onChange={(v) => {
                  setPage(1);
                  setSort(v);
                }}
                options={[
                  { label: "Newest", value: "-createdAt" },
                  { label: "Oldest", value: "createdAt" },
                  { label: "Highest Rating", value: "-rating" },
                  { label: "Lowest Rating", value: "rating" }
                ]}
              />
              <button
                onClick={() => load()}
                className="mt-6 rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/70 transition backdrop-blur"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* list */}
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-glass backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">Loading…</div>
                <div className="mt-1 text-xs text-slate-600">Fetching reviews from server.</div>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-glass backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">No reviews</div>
                <div className="mt-1 text-xs text-slate-600">
                  Create your first review on the left.
                </div>
              </div>
            ) : (
              items.map((r) => (
                <div
                  key={r._id || r.id}
                  className="rounded-3xl border border-white/60 bg-white/55 p-4 shadow-glass backdrop-blur"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {r.clientName || "Unnamed"}
                        </div>
                        <span
                          className={cx(
                            "rounded-full border px-2 py-1 text-[10px] font-semibold",
                            r.isPublished
                              ? "border-emerald-200/70 bg-emerald-100/50 text-emerald-900"
                              : "border-amber-200/70 bg-amber-100/50 text-amber-900"
                          )}
                        >
                          {r.isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <Stars value={r.rating} />
                        <span className="text-xs text-slate-600">
                          {Number(r.rating || 0).toFixed(1)} / 5
                        </span>
                      </div>

                      {r.clientUrl ? (
                        <a
                          href={r.clientUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs font-semibold text-slate-800 underline truncate"
                        >
                          {r.clientUrl}
                        </a>
                      ) : null}

                      <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                        “{r.text}”
                      </p>

                      <div className="mt-3 text-[11px] text-slate-500">
                        {r.createdAt ? `Created: ${new Date(r.createdAt).toLocaleString()}` : ""}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 md:items-end">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onTogglePublish(r)}
                        className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
                      >
                        {r.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => onDelete(r)}
                        className="rounded-2xl border border-rose-200/70 bg-rose-100/50 px-3 py-2 text-xs font-semibold text-rose-900 shadow-glass hover:bg-rose-100/70 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* pagination */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={cx(
                "rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-xs font-semibold shadow-glass backdrop-blur transition",
                page <= 1
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-800 hover:bg-white/70"
              )}
            >
              ← Prev
            </button>

            <div className="text-xs text-slate-600">
              Page <span className="font-semibold text-slate-900">{page}</span> /{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={cx(
                "rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-xs font-semibold shadow-glass backdrop-blur transition",
                page >= totalPages
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-800 hover:bg-white/70"
              )}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* edit modal */}
      <Modal
        open={editOpen}
        title="Edit Review"
        onClose={() => setEditOpen(false)}
      >
        <div className="space-y-3">
          <TextInput
            label="Client Name"
            value={editForm.clientName}
            onChange={(v) => setEditForm((s) => ({ ...s, clientName: v }))}
            placeholder="Client name"
          />
          <TextInput
            label="Client URL (optional)"
            value={editForm.clientUrl}
            onChange={(v) => setEditForm((s) => ({ ...s, clientUrl: v }))}
            placeholder="https://client.com"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Rating"
              value={String(editForm.rating)}
              onChange={(v) => setEditForm((s) => ({ ...s, rating: Number(v) }))}
              options={[
                { label: "5 ★", value: "5" },
                { label: "4 ★", value: "4" },
                { label: "3 ★", value: "3" },
                { label: "2 ★", value: "2" },
                { label: "1 ★", value: "1" }
              ]}
            />
            <Select
              label="Published"
              value={String(editForm.isPublished)}
              onChange={(v) => setEditForm((s) => ({ ...s, isPublished: v === "true" }))}
              options={[
                { label: "Yes", value: "true" },
                { label: "No", value: "false" }
              ]}
            />
          </div>
          <TextArea
            label="Review Text"
            value={editForm.text}
            onChange={(v) => setEditForm((s) => ({ ...s, text: v }))}
            placeholder="Review content"
            rows={5}
          />

          <div className="flex flex-col md:flex-row gap-2 md:justify-end">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-slate-800 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}