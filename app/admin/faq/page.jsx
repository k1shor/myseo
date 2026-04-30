"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PageShell from "../../../components/PageShell";
import { getUser } from "../../../lib/auth";
import {
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
} from "../../../lib/faqApi";

/* --- Helpers --- */

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

/* --- Sub-components --- */

function Toast({ toast }) {
  if (!toast) return null;
  return (
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
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <input
        className={cx(
          "mt-1 w-full rounded-2xl border border-white/60 bg-white/55",
          "px-4 py-2 text-sm text-slate-900 outline-none",
          "shadow-glass backdrop-blur",
          "focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
        )}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
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
        className={cx(
          "mt-1 w-full rounded-2xl border border-white/60 bg-white/55",
          "px-4 py-2 text-sm text-slate-900 outline-none resize-none",
          "shadow-glass backdrop-blur",
          "focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
        )}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/50 p-3 shadow-glass backdrop-blur">
      <div className="text-xs font-semibold text-slate-900">{label}</div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-7 w-12 rounded-full border border-white/60 transition-colors duration-200 focus:outline-none",
          checked ? "bg-slate-900" : "bg-slate-200/60"
        )}
        aria-pressed={checked}
      >
        <span
          className={cx(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

/* --- Filter Tabs --- */

function FilterTabs({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/40 p-1 backdrop-blur w-fit">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          className={cx(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition",
            active === f.key
              ? "bg-slate-900 text-white shadow-soft"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          {f.label}
          <span
            className={cx(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
              active === f.key
                ? "bg-white/20 text-white"
                : "bg-slate-900/10 text-slate-600"
            )}
          >
            {counts[f.key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

/* --- Sortable FAQ row --- */

function SortableRow({ faq, onEdit, onDelete, onTogglePublish, fallbackId }) {
  const realId = faq?._id || faq?.id;
  const sortableId = realId ?? fallbackId;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "rounded-3xl border border-white/60 bg-white/55 p-4 shadow-glass backdrop-blur-xl",
        "flex items-start justify-between gap-4",
        isDragging ? "opacity-75 ring-2 ring-slate-900/10" : ""
      )}
    >
      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {faq?.question || "Untitled"}
          </span>
          <span
            className={cx(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0",
              faq?.isPublished
                ? "border-emerald-200/70 bg-emerald-100/50 text-emerald-900"
                : "border-amber-200/70 bg-amber-100/50 text-amber-900"
            )}
          >
            {faq?.isPublished ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
          {faq?.answer}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <button
          ref={setActivatorNodeRef}
          type="button"
          title="Drag to reorder (All tab only)"
          className="cursor-grab active:cursor-grabbing rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        <button
          type="button"
          onClick={() => onTogglePublish(faq)}
          className={cx(
            "rounded-2xl border px-3 py-2 text-xs font-semibold shadow-glass transition",
            faq?.isPublished
              ? "border-amber-200/70 bg-amber-50/60 text-amber-900 hover:bg-amber-100/70"
              : "border-emerald-200/70 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/70"
          )}
        >
          {faq?.isPublished ? "Unpublish" : "Publish"}
        </button>

        <button
          type="button"
          onClick={() => onEdit(faq)}
          className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(faq)}
          className="rounded-2xl border border-rose-200/70 bg-rose-100/55 px-3 py-2 text-xs font-semibold text-rose-900 shadow-glass hover:bg-rose-100/75 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* --- Edit Modal --- */

function EditModal({ open, faq, onClose, onSave }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question || "");
      setAnswer(faq.answer || "");
      setIsPublished(!!faq.isPublished);
    }
  }, [faq]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/50 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-sm font-semibold text-slate-900">Edit FAQ</div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <TextInput
            label="Question"
            value={question}
            onChange={setQuestion}
            placeholder="Type the question..."
          />
          <TextArea
            label="Answer"
            value={answer}
            onChange={setAnswer}
            placeholder="Type the answer..."
            rows={5}
          />
          <Toggle
            label={isPublished ? "Published ✅" : "Draft (not visible on site)"}
            checked={isPublished}
            onChange={setIsPublished}
          />
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ question, answer, isPublished })}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-slate-800 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Main Page ---*/

export default function AdminFaqPage() {
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // "all" | "published" | "draft"
  const [activeFilter, setActiveFilter] = useState("all");

  // Create form
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newPublished, setNewPublished] = useState(true);
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /* ── Auth ── */
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
    setChecking(false);
  }, []);

  /* ── Toast ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Load ── */
  async function load() {
    setLoading(true);
    try {
      const data = await getAdminFaqs();
      setItems(data?.items || []);
    } catch {
      setToast({ type: "err", msg: "Failed to load FAQs." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mounted || checking) return;
    load();
  }, [mounted, checking]);

  /* ── Counts & filtered list (client-side, no extra API call needed) ── */
  const counts = useMemo(
    () => ({
      all: items.length,
      published: items.filter((i) => i.isPublished).length,
      draft: items.filter((i) => !i.isPublished).length,
    }),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === "published") return items.filter((i) => i.isPublished);
    if (activeFilter === "draft") return items.filter((i) => !i.isPublished);
    return items;
  }, [items, activeFilter]);

  const sortableIds = useMemo(
    () => filteredItems.map((i, idx) => i?._id || i?.id || `fallback-${idx}`),
    [filteredItems]
  );

  /* ── Create ── */
  async function handleCreate(e) {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setToast({ type: "err", msg: "Question and answer are required." });
      return;
    }
    setCreating(true);
    try {
      await createFaq({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        isPublished: newPublished,
      });
      setToast({ type: "ok", msg: "FAQ created." });
      setNewQuestion("");
      setNewAnswer("");
      setNewPublished(true);
      await load();
    } catch (e) {
      setToast({
        type: "err",
        msg: e?.response?.data?.message || e?.message || "Create failed.",
      });
    } finally {
      setCreating(false);
    }
  }

  /* ── Edit ── */
  function openEdit(faq) {
    setEditTarget(faq);
    setEditOpen(true);
  }

  async function handleSaveEdit({ question, answer, isPublished }) {
    if (!editTarget) return;
    const id = editTarget._id || editTarget.id;
    try {
      await updateFaq(id, { question, answer, isPublished });
      setToast({ type: "ok", msg: "FAQ updated." });
      setEditOpen(false);
      await load();
    } catch (e) {
      setToast({
        type: "err",
        msg: e?.response?.data?.message || e?.message || "Update failed.",
      });
    }
  }

  /* ── Toggle publish ── */
  async function handleTogglePublish(faq) {
    const id = faq._id || faq.id;
    try {
      await updateFaq(id, { isPublished: !faq.isPublished });
      setToast({
        type: "ok",
        msg: faq.isPublished ? "Moved to drafts." : "FAQ published.",
      });
      await load();
    } catch (e) {
      setToast({
        type: "err",
        msg: e?.response?.data?.message || e?.message || "Update failed.",
      });
    }
  }

  /* ── Delete ── */
  async function handleDelete(faq) {
    if (!window.confirm("Delete this FAQ? This cannot be undone.")) return;
    const id = faq._id || faq.id;
    try {
      await deleteFaq(id);
      setToast({ type: "ok", msg: "FAQ deleted." });
      await load();
    } catch (e) {
      setToast({
        type: "err",
        msg: e?.response?.data?.message || e?.message || "Delete failed.",
      });
    }
  }

  /* ── Drag & Drop ── */
  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // filter for reordering only from all tab
    if (activeFilter !== "all") {
      setToast({
        type: "err",
        msg: 'Switch to the "All" tab to drag-reorder FAQs.',
      });
      return;
    }

    const oldIndex = sortableIds.findIndex((x) => x === active.id);
    const newIndex = sortableIds.findIndex((x) => x === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await reorderFaqs(
        newItems.map((item, index) => ({
          id: item._id || item.id,
          order: index,
        }))
      );
      setToast({ type: "ok", msg: "Order saved." });
    } catch {
      setToast({ type: "err", msg: "Reorder failed — reloading." });
      await load();
    }
  }

  /* ── Guard ── */
  if (!mounted || checking) {
    return (
      <PageShell title="FAQs" kicker="CMS">
        <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">Loading…</div>
          <div className="mt-2 text-sm text-slate-600">
            Checking access permissions.
          </div>
        </div>
      </PageShell>
    );
  }

  function renderHint() {
    if (loading) return null;

    if (activeFilter === "all" && items.length > 1) {
      return (
        <div className="mb-3 rounded-2xl border border-sky-200/60 bg-sky-50/50 px-4 py-2 text-[11px] text-sky-800 shadow-glass backdrop-blur shrink-0">
          ⠿ Drag the handle on any row to reorder. Order is saved automatically.
        </div>
      );
    }

    if (activeFilter !== "all" && filteredItems.length > 1) {
      return (
        <div className="mb-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 px-4 py-2 text-[11px] text-amber-800 shadow-glass backdrop-blur shrink-0">
          Switch to <span className="font-semibold">All</span> to drag-reorder
          FAQs.
        </div>
      );
    }

    if (activeFilter !== "all" && filteredItems.length === 0) {
      return (
        <div className="mb-3 rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-xs text-slate-600 shadow-glass backdrop-blur shrink-0">
          {activeFilter === "published"
            ? "No published FAQs yet. Use the Publish button on any draft."
            : "No draft FAQs — all your FAQs are currently published."}
        </div>
      );
    }

    return null;
  }

  return (
    <PageShell
      title="FAQs"
      kicker="CMS"
      subtitle="Manage FAQ questions and answers"
    >
      <Toast toast={toast} />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* ── Create form ── */}
        <div className="lg:col-span-5 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">
            Add New FAQ
          </div>

          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <TextInput
              label="Question"
              value={newQuestion}
              onChange={setNewQuestion}
              placeholder="e.g. How long does SEO take?"
            />
            <TextArea
              label="Answer"
              value={newAnswer}
              onChange={setNewAnswer}
              placeholder="Write a clear, helpful answer..."
              rows={7}
            />
            <Toggle
              label={newPublished ? "Published ✅" : "Save as Draft"}
              checked={newPublished}
              onChange={setNewPublished}
            />

            <button
              type="submit"
              disabled={creating}
              className={cx(
                "w-full rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-soft transition",
                creating
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-slate-800"
              )}
            >
              {creating ? "Adding..." : "Add FAQ"}
            </button>

            <div className="text-[11px] text-slate-500">
              Tip: Keep answers concise. Switch to the{" "}
              <span className="font-semibold text-slate-700">All</span> tab to
              drag-reorder ✨
            </div>
          </form>
        </div>

        {/* ── FAQ list ── */}
        <div className="lg:col-span-7 flex flex-col h-fit max-h-[80vh] rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                All FAQs
              </div>
              <div className="mt-0.5 text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filteredItems.length}
                </span>{" "}
                of {items.length} total
              </div>
            </div>
            <button
              onClick={load}
              className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/70 transition backdrop-blur"
            >
              Refresh
            </button>
          </div>

          {/* Filter tabs */}
          <div className="mb-3 shrink-0">
            <FilterTabs
              active={activeFilter}
              onChange={(key) => setActiveFilter(key)}
              counts={counts}
            />
          </div>

          {/* Contextual hint */}
          {renderHint()}

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-3xl bg-white/50 animate-pulse"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-glass backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">
                  No FAQs yet
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Add your first FAQ using the form on the left.
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortableIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 pb-2">
                    {filteredItems.map((faq, idx) => (
                      <SortableRow
                        key={faq?._id || faq?.id || `fallback-key-${idx}`}
                        faq={faq}
                        fallbackId={`fallback-${idx}`}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onTogglePublish={handleTogglePublish}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditModal
        open={editOpen}
        faq={editTarget}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
      />
    </PageShell>
  );
}
