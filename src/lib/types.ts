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
  created_at: string;
};

export type Outfit = {
  id: string;
  user_id: string;
  name: string | null;
  item_ids: string[];
  created_at: string;
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
