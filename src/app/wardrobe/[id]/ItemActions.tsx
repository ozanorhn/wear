"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ItemActions({
  id,
  imageUrl,
  isFavorite,
}: {
  id: string;
  imageUrl: string;
  isFavorite: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [fav, setFav] = useState(isFavorite);

  async function toggleFavorite() {
    const next = !fav;
    setFav(next);
    const { error } = await supabase.from("items").update({ is_favorite: next }).eq("id", id);
    if (error) setFav(!next);
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Dieses Kleidungsstück löschen?")) return;
    setBusy(true);
    await supabase.from("items").delete().eq("id", id);
    try {
      const url = new URL(imageUrl);
      const path = url.pathname.split("/object/public/clothes/")[1];
      if (path) await supabase.storage.from("clothes").remove([decodeURIComponent(path)]);
    } catch {}
    router.replace("/wardrobe");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-2">
      <button
        onClick={toggleFavorite}
        className={`btn w-full ${fav ? "bg-rose-500 text-white" : "btn-outline"}`}
      >
        <Heart size={16} fill={fav ? "currentColor" : "none"} />
        {fav ? "Favorit" : "Als Favorit markieren"}
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        className="btn btn-outline w-full text-red-600"
      >
        <Trash2 size={16} />
        {busy ? "Lösche…" : "Löschen"}
      </button>
    </div>
  );
}
