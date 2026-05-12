export const CATEGORIES = [
  "T-Shirt",
  "Hemd",
  "Pullover",
  "Hose",
  "Rock",
  "Kleid",
  "Schuhe",
  "Jacke",
  "Mütze",
  "Schmuck",
  "Tasche",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SEASONS = ["Sommer", "Winter", "Übergang", "Ganzjährig"] as const;
export type Season = (typeof SEASONS)[number];

export const OCCASIONS = ["Lässig", "Formell", "Sport", "Strand", "Party"] as const;
export type Occasion = (typeof OCCASIONS)[number];

export type Item = {
  id: string;
  user_id: string;
  name: string | null;
  category: Category;
  color: string | null;
  seasons: Season[];
  occasions: Occasion[];
  notes: string | null;
  image_url: string;
  is_favorite: boolean;
  last_worn_at: string | null;
  wear_count: number;
  created_at: string;
};

export type Outfit = {
  id: string;
  user_id: string;
  name: string | null;
  item_ids: string[];
  is_favorite: boolean;
  last_worn_at: string | null;
  wear_count: number;
  tryon_url: string | null;
  created_at: string;
};

export type Wear = {
  id: string;
  user_id: string;
  outfit_id: string | null;
  item_ids: string[];
  worn_at: string;
};

export type WeatherCondition = "kalt" | "kühl" | "mild" | "warm" | "heiß";

export function tempToCondition(tempC: number): WeatherCondition {
  if (tempC < 5) return "kalt";
  if (tempC < 12) return "kühl";
  if (tempC < 20) return "mild";
  if (tempC < 27) return "warm";
  return "heiß";
}

export function seasonForCondition(c: WeatherCondition): Season[] {
  if (c === "kalt" || c === "kühl") return ["Winter", "Übergang", "Ganzjährig"];
  if (c === "mild") return ["Übergang", "Ganzjährig"];
  return ["Sommer", "Ganzjährig"];
}

export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatLastWorn(iso: string | null): string {
  const days = daysSince(iso);
  if (days === null) return "noch nie";
  if (days === 0) return "heute";
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  if (days < 365) return `vor ${Math.floor(days / 30)} Monaten`;
  return `vor ${Math.floor(days / 365)} Jahren`;
}
