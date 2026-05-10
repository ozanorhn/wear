"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, type Category, type Item } from "@/lib/types";

export function WardrobeGrid({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState<Category | "Alle">("Alle");

  const visible = useMemo(() => {
    if (filter === "Alle") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const present = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return CATEGORIES.filter((c) => set.has(c));
  }, [items]);

  return (
    <>
      <div className="scroll-x -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        <button
          onClick={() => setFilter("Alle")}
          className={`chip ${filter === "Alle" ? "chip-active" : ""}`}
        >
          Alle ({items.length})
        </button>
        {present.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`chip whitespace-nowrap ${filter === c ? "chip-active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visible.map((item) => (
          <Link
            key={item.id}
            href={`/wardrobe/${item.id}`}
            className="card overflow-hidden active:scale-[0.98]"
          >
            <div className="relative aspect-square bg-border/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.name ?? item.category}
                className="absolute inset-0 h-full w-full object-contain p-2"
                loading="lazy"
              />
            </div>
            <div className="px-3 py-2">
              <div className="truncate text-sm font-medium">
                {item.name ?? item.category}
              </div>
              <div className="truncate text-xs text-muted">
                {item.category}
                {item.color ? ` · ${item.color}` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
