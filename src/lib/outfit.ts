import type { Category, Item, Season } from "./types";

export type Slot = "Oberteil" | "Unterteil" | "Schuhe" | "Jacke" | "Kopfbedeckung" | "Accessoire";

export const SLOT_ORDER: Slot[] = [
  "Kopfbedeckung",
  "Jacke",
  "Oberteil",
  "Unterteil",
  "Schuhe",
  "Accessoire",
];

export function slotOf(c: Category): Slot {
  switch (c) {
    case "T-Shirt":
    case "Hemd":
    case "Pullover":
    case "Kleid":
      return "Oberteil";
    case "Hose":
    case "Rock":
      return "Unterteil";
    case "Schuhe":
      return "Schuhe";
    case "Jacke":
      return "Jacke";
    case "Mütze":
      return "Kopfbedeckung";
    case "Schmuck":
    case "Tasche":
      return "Accessoire";
  }
}

export function groupBySlot(items: Item[]): Record<Slot, Item[]> {
  const out: Record<Slot, Item[]> = {
    Kopfbedeckung: [],
    Jacke: [],
    Oberteil: [],
    Unterteil: [],
    Schuhe: [],
    Accessoire: [],
  };
  for (const i of items) out[slotOf(i.category)].push(i);
  return out;
}

function pick<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomOutfit(items: Item[], seasonFilter?: Season[]): Item[] {
  const pool = seasonFilter && seasonFilter.length > 0
    ? items.filter((i) => i.seasons.length === 0 || i.seasons.some((s) => seasonFilter.includes(s)))
    : items;

  const grouped = groupBySlot(pool);
  const chosen: Item[] = [];

  // Either dress alone, or top + bottom
  const dresses = grouped.Oberteil.filter((i) => i.category === "Kleid");
  const tops = grouped.Oberteil.filter((i) => i.category !== "Kleid");

  if (dresses.length > 0 && (tops.length === 0 || Math.random() < 0.25)) {
    const d = pick(dresses);
    if (d) chosen.push(d);
  } else {
    const top = pick(tops);
    if (top) chosen.push(top);
    const bottom = pick(grouped.Unterteil);
    if (bottom) chosen.push(bottom);
  }

  const shoes = pick(grouped.Schuhe);
  if (shoes) chosen.push(shoes);

  if (seasonFilter?.includes("Winter") || seasonFilter?.includes("Übergang")) {
    const jacket = pick(grouped.Jacke);
    if (jacket) chosen.push(jacket);
  } else if (grouped.Jacke.length > 0 && Math.random() < 0.35) {
    const jacket = pick(grouped.Jacke);
    if (jacket) chosen.push(jacket);
  }

  return chosen;
}
