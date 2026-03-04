"use client";

import { useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

function SortableItem({ tool, onDelete, onEdit }) {
  const id = tool?._id || tool?.id;
  if (!id) return null;

  const {
    attributes,
    listeners,
    setNodeRef,
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
      whileHover={{ scale: 1.01 }}
      className={[
        "relative rounded-3xl border border-white/60 bg-white/55 p-5",
        "shadow-glass backdrop-blur-xl flex items-center justify-between gap-4",
        "hover:shadow-purple-200/60 transition",
        isDragging ? "opacity-80 ring-2 ring-slate-900/10" : ""
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
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {/* ✅ Drag handle only */}
        <button
          type="button"
          title="Drag to reorder"
          className="cursor-grab active:cursor-grabbing rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(tool);
          }}
          className="rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
        >
          Edit
        </button>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="rounded-2xl border border-rose-200/70 bg-rose-100/50 px-3 py-2 text-xs font-semibold text-rose-900 shadow-glass hover:bg-rose-100/70 transition"
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
  onEdit
}) {
  const ids = useMemo(
    () => (Array.isArray(items) ? items.map((i) => i?._id || i?.id).filter(Boolean) : []),
    [items]
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => (i._id || i.id) === active.id);
    const newIndex = items.findIndex((i) => (i._id || i.id) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await onReorder(newItems);
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
          {items.map((tool) => (
            <SortableItem
              key={tool._id || tool.id}
              tool={tool}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}