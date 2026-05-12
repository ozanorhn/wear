"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Shirt, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function OutfitActions({
  id,
  isFavorite,
}: {
  id: string;
  isFavorite: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [wearing, setWearing] = useState(false);
  const [worn, setWorn] = useState(false);
  const [fav, setFav] = useState(isFavorite);

  async function logWear() {
    setWearing(true);
    const { data: outfit } = await supabase
      .from("outfits")
      .select("user_id, item_ids")
      .eq("id", id)
      .maybeSingle();
    if (!outfit) {
      setWearing(false);
      return;
    }
    await supabase.from("wears").insert({
      user_id: outfit.user_id,
      outfit_id: id,
      item_ids: outfit.item_ids,
    });
    setWearing(false);
    setWorn(true);
    router.refresh();
  }

  async function toggleFavorite() {
    const next = !fav;
    setFav(next);
    const { error } = await supabase.from("outfits").update({ is_favorite: next }).eq("id", id);
    if (error) setFav(!next);
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Dieses Outfit löschen?")) return;
    setBusy(true);
    await supabase.from("outfits").delete().eq("id", id);
    router.replace("/outfits");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-2">
      <button onClick={logWear} disabled={wearing || worn} className="btn btn-primary w-full">
        <Shirt size={16} />
        {worn ? "Heute eingetragen ✓" : wearing ? "Speichere…" : "Heute getragen"}
      </button>
      <button
        onClick={toggleFavorite}
        className={`btn w-full ${fav ? "bg-rose-500 text-white" : "btn-outline"}`}
      >
        <Heart size={16} fill={fav ? "currentColor" : "none"} />
        {fav ? "Favorit" : "Als Favorit markieren"}
      </button>
      <button onClick={onDelete} disabled={busy} className="btn btn-outline w-full text-red-600">
        <Trash2 size={16} />
        {busy ? "Lösche…" : "Löschen"}
      </button>
    </div>
  );
}
