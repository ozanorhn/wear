"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function OutfitActions({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Dieses Outfit löschen?")) return;
    setBusy(true);
    await supabase.from("outfits").delete().eq("id", id);
    router.replace("/outfits");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <button onClick={onDelete} disabled={busy} className="btn btn-outline w-full text-red-600">
        <Trash2 size={16} />
        {busy ? "Lösche…" : "Löschen"}
      </button>
    </div>
  );
}
