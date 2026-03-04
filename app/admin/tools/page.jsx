"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
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
  uploadToolImage
} from "../../../lib/toolsApi";
import { getUser } from "../../../lib/auth";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function SortableItem({ tool, onEdit, onDelete }) {
  const id = tool?._id || tool?.id;
  if (!id) return null;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      whileHover={{ y: -2 }}
      className={cx(
        "group relative overflow-hidden rounded-3xl border border-white/60",
        "bg-white/55 p-5 shadow-glass backdrop-blur-xl",
        "flex items-center justify-between gap-4",
        "transition hover:shadow-purple-200/70",
        isDragging ? "opacity-75 ring-2 ring-slate-900/10" : ""
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
        </div>
      </div>

      <div className="relative flex items-center gap-2 shrink-0">
        {/* ✅ Drag Handle ONLY */}
        <button
          ref={setActivatorNodeRef}
          type="button"
          title="Drag to reorder"
          className={cx(
            "cursor-grab active:cursor-grabbing select-none",
            "rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold",
            "text-slate-800 shadow-glass hover:bg-white/80 transition"
          )}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        {/* ✅ Edit */}
        <button
          type="button"
          onClick={() => onEdit(tool)}
          className={cx(
            "rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold",
            "text-slate-800 shadow-glass hover:bg-white/80 transition"
          )}
        >
          Edit
        </button>

        {/* ✅ Delete */}
        <button
          type="button"
          onClick={() => onDelete(id)}
          className={cx(
            "rounded-2xl border border-rose-200/70 bg-rose-100/55 px-3 py-2 text-xs font-semibold",
            "text-rose-900 shadow-glass hover:bg-rose-100/75 transition"
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

  const sortableIds = useMemo(
    () => items.map((i) => i?._id || i?.id).filter(Boolean),
    [items]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;

    const payload = {
      name: String(form.name || "").trim(),
      description: String(form.description || "").trim(),
      image: String(form.image || "").trim()
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
      image: tool?.image || ""
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

    const oldIndex = items.findIndex((i) => (i._id || i.id) === active.id);
    const newIndex = items.findIndex((i) => (i._id || i.id) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await reorderTools({
        items: newItems.map((item, index) => ({
          id: item._id || item.id,
          order: index
        }))
      });
    } catch (e) {
      console.error("Reorder failed:", e);
      // optional: reload to restore order from server
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
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              {items.map((tool) => (
                <SortableItem
                  key={tool._id || tool.id}
                  tool={tool}
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