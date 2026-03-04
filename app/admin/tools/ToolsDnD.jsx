"use client";

import { useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

function SortableItem({ tool, onDelete, onEdit, fallbackId }) {
  // ✅ Always compute an id, even if tool is missing it
  const realId = tool?._id || tool?.id;
  const sortableId = realId ?? fallbackId;

  // ✅ Hook is now NEVER conditional
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // If the tool has no real id, we should NOT allow edit/delete/reorder persistence.
  // But we can still render a row (non-interactive) without breaking hooks.
  const disabled = !realId;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      whileHover={disabled ? undefined : { scale: 1.01 }}
      className={[
        "relative rounded-3xl border border-white/60 bg-white/55 p-5",
        "shadow-glass backdrop-blur-xl flex items-center justify-between gap-4",
        "hover:shadow-purple-200/60 transition",
        isDragging ? "opacity-80 ring-2 ring-slate-900/10" : "",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        {tool?.image ? (
          <img
            src={tool.image}
            alt={tool?.name || "tool"}
            className="h-10 w-10 object-contain rounded-xl"
            draggable={false}
          />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-200/60 via-violet-200/60 to-sky-200/60" />
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
              Missing id: item is not sortable/editable
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {/* ✅ Drag handle only */}
        <button
          type="button"
          title={disabled ? "Missing id" : "Drag to reorder"}
          disabled={disabled}
          className={[
            "rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass transition",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-grab active:cursor-grabbing hover:bg-white/80",
          ].join(" ")}
          {...(!disabled ? attributes : {})}
          {...(!disabled ? listeners : {})}
        >
          ⠿
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onEdit(tool);
          }}
          className={[
            "rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass transition",
            disabled ? "cursor-not-allowed opacity-60" : "hover:bg-white/80",
          ].join(" ")}
        >
          Edit
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onDelete(realId);
          }}
          className={[
            "rounded-2xl border border-rose-200/70 bg-rose-100/50 px-3 py-2 text-xs font-semibold text-rose-900 shadow-glass transition",
            disabled ? "cursor-not-allowed opacity-60" : "hover:bg-rose-100/70",
          ].join(" ")}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default function ToolsDnD({
  items = [],
  setItems,
  onReorder,
  onDelete,
  onEdit,
}) {
  // ✅ Ensure every item in SortableContext has a stable id
  // Prefer real ids; if missing, create a deterministic fallback based on index.
  const ids = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.map((i, idx) => i?._id || i?.id || `fallback-${idx}`);
  }, [items]);

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Map active/over ids back to indices using ids array (covers fallbacks too)
    const oldIndex = ids.findIndex((x) => x === active.id);
    const newIndex = ids.findIndex((x) => x === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await onReorder?.(newItems);
    } catch (err) {
      console.error("Reorder failed:", err);
    }
  }

  if (!items?.length) {
    return (
      <div className="rounded-3xl border border-white/60 bg-white/50 p-4 shadow-glass backdrop-blur">
        No tools yet.
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((tool, idx) => (
            <SortableItem
              key={tool?._id || tool?.id || `fallback-key-${idx}`}
              tool={tool}
              onDelete={onDelete}
              onEdit={onEdit}
              fallbackId={`fallback-${idx}`}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}