"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dices, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { randomOutfit } from "@/lib/outfit";
import type { Item } from "@/lib/types";

export function RandomOutfit({ items }: { items: Item[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [pick, setPick] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPick(randomOutfit(items));
  }, [items]);

  function shuffle() {
    setPick(randomOutfit(items));
    setSaved(false);
  }

  async function save() {
    if (pick.length === 0) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    await supabase.from("outfits").insert({
      user_id: user.id,
      name: null,
      item_ids: pick.map((i) => i.id),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        Du brauchst erst ein paar Kleidungsstücke im Schrank.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card grid grid-cols-2 gap-2 p-3">
        {pick.length === 0 && (
          <p className="col-span-2 py-6 text-center text-sm text-muted">
            Kein Outfit gefunden — füg mehr Teile hinzu.
          </p>
        )}
        {pick.map((p) => (
          <div
            key={p.id}
            className="relative aspect-square overflow-hidden rounded-xl bg-border/30"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image_url}
              alt={p.category}
              className="absolute inset-0 h-full w-full object-contain p-2"
            />
            <span className="absolute bottom-1 left-1 rounded-full bg-fg/85 px-2 py-0.5 text-[10px] font-medium text-bg">
              {p.category}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={shuffle} className="btn btn-outline">
          <Dices size={16} />
          Neu würfeln
        </button>
        <button
          onClick={save}
          disabled={saving || saved || pick.length === 0}
          className="btn btn-primary"
        >
          <Save size={16} />
          {saved ? "Gespeichert" : saving ? "Speichere…" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
