"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ItemActions({ id, imageUrl }: { id: string; imageUrl: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
    <div className="mt-6">
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
