"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import PageShell from "../../../components/PageShell";
import {
  getTools,
  createTool,
  updateTool,
  deleteTool,
  reorderTools,
  uploadToolImage,
} from "../../../lib/toolsApi";
import { getUser } from "../../../lib/auth";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * Sortable row.
 * ✅ Hooks are NEVER conditional.
 * ✅ Uses a stable fallback id if tool has no _id/id (shouldn't happen, but safe).
 */
function SortableItem({ tool, onEdit, onDelete, fallbackId }) {
  const realId = tool?._id || tool?.id;
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const disabled = !realId; // missing real id → no edit/delete/reorder persistence

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      whileHover={disabled ? undefined : { y: -2 }}
      className={cx(
        "group relative overflow-hidden rounded-3xl border border-white/60",
        "bg-white/55 p-5 shadow-glass backdrop-blur-xl",
        "flex items-center justify-between gap-4",
        "transition hover:shadow-purple-200/70",
        isDragging ? "opacity-75 ring-2 ring-slate-900/10" : "",
        disabled ? "opacity-60" : ""
      )}
    >
      {/* gradient wash */}
      <div className="pointer-events-none absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl bg-gradient-to-br from-pink-200/30 via-violet-200/30 to-sky-200/30" />

      <div className="relative flex items-center gap-4 min-w-0">
        {tool?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.image}
            alt={tool?.name || "Tool"}
            className="h-10 w-10 rounded-xl object-contain bg-white/40 border border-white/60"
            draggable={false}
          />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-200/60 via-violet-200/60 to-sky-200/60 border border-white/60" />
        )}

        <div className="min-w-0">
          <div className="font-semibold text-slate-900 truncate">
            {tool?.name || "Untitled"}
          </div>
          <div className="text-sm text-slate-600 line-clamp-2">
            {tool?.description || ""}
          </div>

          {disabled && (
            <div className="mt-1 text-[11px] text-rose-700">
              Missing id: item can’t be reordered/edited
            </div>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-2 shrink-0">
        {/* ✅ Drag Handle ONLY */}
        <button
          ref={setActivatorNodeRef}
          type="button"
          title={disabled ? "Missing id" : "Drag to reorder"}
          disabled={disabled}
          className={cx(
            "select-none",
            "rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold",
            "text-slate-800 shadow-glass transition",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-grab active:cursor-grabbing hover:bg-white/80"
          )}
          {...(!disabled ? attributes : {})}
          {...(!disabled ? listeners : {})}
        >
          ⠿
        </button>

        {/* ✅ Edit */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) onEdit(tool);
          }}
          className={cx(
            "rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold",
            "text-slate-800 shadow-glass transition",
            disabled ? "cursor-not-allowed opacity-60" : "hover:bg-white/80"
          )}
        >
          Edit
        </button>

        {/* ✅ Delete */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) onDelete(realId);
          }}
          className={cx(
            "rounded-2xl border border-rose-200/70 bg-rose-100/55 px-3 py-2 text-xs font-semibold",
            "text-rose-900 shadow-glass transition",
            disabled ? "cursor-not-allowed opacity-60" : "hover:bg-rose-100/75"
          )}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminTools() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "admin") {
      window.location.href = "/login";
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const res = await getTools();
    setItems(res?.items || []);
  }

  /**
   * ✅ SortableContext requires that every row has a stable id.
   * We provide fallback ids for safety, but ideally server ALWAYS returns _id.
   */
  const sortableIds = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.map((i, idx) => i?._id || i?.id || `fallback-${idx}`);
  }, [items]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;

    const payload = {
      name: String(form.name || "").trim(),
      description: String(form.description || "").trim(),
      image: String(form.image || "").trim(),
    };

    if (!payload.name || !payload.description || !payload.image) {
      alert("Name, description, and image are required.");
      return;
    }

    try {
      setBusy(true);
      if (editing) {
        await updateTool(editing, payload);
      } else {
        await createTool({ ...payload, order: items.length });
      }

      setForm({ name: "", description: "", image: "" });
      setEditing(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      const res = await uploadToolImage(file);
      setForm((f) => ({ ...f, image: res.url }));
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(tool) {
    const id = tool?._id || tool?.id;
    if (!id) return;

    setEditing(id);
    setForm({
      name: tool?.name || "",
      description: tool?.description || "",
      image: tool?.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("Delete this tool? This cannot be undone.");
    if (!ok) return;

    try {
      setBusy(true);
      await deleteTool(id);

      if (editing === id) {
        setEditing(null);
        setForm({ name: "", description: "", image: "" });
      }

      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // ✅ Use sortableIds (covers fallback ids too)
    const oldIndex = sortableIds.findIndex((x) => x === active.id);
    const newIndex = sortableIds.findIndex((x) => x === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Only persist reorder if ALL items have real ids
    const hasAllRealIds = newItems.every((it) => it?._id || it?.id);
    if (!hasAllRealIds) return;

    try {
      await reorderTools({
        items: newItems.map((item, index) => ({
          id: item._id || item.id,
          order: index,
        })),
      });
    } catch (e) {
      console.error("Reorder failed:", e);
      await load();
    }
  }

  return (
    <PageShell title="Tools" kicker="CMS">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-4 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">
              {editing ? "Update Tool" : "Create Tool"}
            </div>

            {editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "", description: "", image: "" });
                }}
                className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/70 transition"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tool Name"
              className="w-full rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-sm text-slate-900 shadow-glass backdrop-blur outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              className="w-full rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-sm text-slate-900 shadow-glass backdrop-blur outline-none focus:ring-2 focus:ring-slate-900/10"
              rows={6}
            />

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-800">
                Tool Image
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm"
              />
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt="Preview"
                  className="mt-2 h-12 w-12 rounded-xl object-contain bg-white/40 border border-white/60"
                />
              ) : null}
            </div>

            <button
              disabled={busy}
              className={cx(
                "w-full rounded-2xl bg-slate-900 text-white py-2 text-sm shadow-soft transition",
                busy ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-800"
              )}
            >
              {busy ? "Please wait..." : editing ? "Update Tool" : "Add Tool"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-8 space-y-4">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {items.map((tool, idx) => (
                <SortableItem
                  key={tool?._id || tool?.id || `fallback-key-${idx}`}
                  tool={tool}
                  fallbackId={`fallback-${idx}`}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </PageShell>
  );
}