"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Clock, Search, X } from "lucide-react";
import { CATEGORIES, daysSince, type Category, type Item } from "@/lib/types";

type Filter = Category | "Alle" | "Favoriten" | "Lang nicht getragen";

export function WardrobeGrid({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState<Filter>("Alle");
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items]);

  const visible = useMemo(() => {
    let list = sorted;
    if (filter === "Favoriten") list = list.filter((i) => i.is_favorite);
    else if (filter === "Lang nicht getragen") {
      list = list.filter((i) => {
        const d = daysSince(i.last_worn_at);
        return d === null || d > 30;
      });
    } else if (filter !== "Alle") {
      list = list.filter((i) => i.category === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          (i.name ?? "").toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.color ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [sorted, filter, query]);

  const present = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return CATEGORIES.filter((c) => set.has(c));
  }, [items]);

  const favCount = items.filter((i) => i.is_favorite).length;
  const oldCount = items.filter((i) => {
    const d = daysSince(i.last_worn_at);
    return d === null || d > 30;
  }).length;

  return (
    <>
      <div className="relative mb-3">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          inputMode="search"
          placeholder="Suchen — Name, Farbe, Kategorie…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-9 pr-9 text-sm"
          aria-label="Im Schrank suchen"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-border/40"
            aria-label="Suche leeren"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="scroll-x -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        <button
          onClick={() => setFilter("Alle")}
          className={`chip whitespace-nowrap ${filter === "Alle" ? "chip-active" : ""}`}
        >
          Alle ({items.length})
        </button>
        {favCount > 0 && (
          <button
            onClick={() => setFilter("Favoriten")}
            className={`chip whitespace-nowrap ${filter === "Favoriten" ? "chip-active" : ""}`}
          >
            <Heart size={12} fill="currentColor" /> {favCount}
          </button>
        )}
        {oldCount > 0 && (
          <button
            onClick={() => setFilter("Lang nicht getragen")}
            className={`chip whitespace-nowrap ${
              filter === "Lang nicht getragen" ? "chip-active" : ""
            }`}
          >
            <Clock size={12} /> Vergessen ({oldCount})
          </button>
        )}
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

      {visible.length === 0 ? (
        <div className="mt-10 text-center text-sm text-muted">
          {query
            ? `Nichts gefunden für „${query}“.`
            : "Keine Teile in dieser Auswahl."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((item) => (
            <Link
              key={item.id}
              href={`/wardrobe/${item.id}`}
              className="card overflow-hidden transition active:scale-[0.98]"
            >
              <div className="relative aspect-square bg-border/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.name ?? item.category}
                  className="absolute inset-0 h-full w-full object-contain p-2"
                  loading="lazy"
                />
                {item.is_favorite && (
                  <span className="absolute right-2 top-2 text-rose-500">
                    <Heart size={16} fill="currentColor" />
                  </span>
                )}
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
      )}
    </>
  );
}
