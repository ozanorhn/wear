"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { groupBySlot, SLOT_ORDER, type Slot } from "@/lib/outfit";
import type { Item } from "@/lib/types";

export function OutfitBuilder({ items }: { items: Item[] }) {
  const router = useRouter();
  const supabase = createClient();
  const grouped = useMemo(() => groupBySlot(items), [items]);
  const slotsWithItems = SLOT_ORDER.filter((s) => grouped[s].length > 0);

  const [selected, setSelected] = useState<Record<Slot, string | null>>({
    Kopfbedeckung: null,
    Jacke: null,
    Oberteil: null,
    Unterteil: null,
    Schuhe: null,
    Accessoire: null,
  });
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosenItems = useMemo(() => {
    const ids = Object.values(selected).filter((x): x is string => Boolean(x));
    return ids
      .map((id) => items.find((i) => i.id === id))
      .filter((x): x is Item => Boolean(x));
  }, [selected, items]);

  function toggle(slot: Slot, id: string) {
    setSelected((s) => ({ ...s, [slot]: s[slot] === id ? null : id }));
  }

  async function save() {
    if (chosenItems.length === 0) {
      setError("Wähl mindestens ein Teil aus.");
      return;
    }
    setSaving(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Nicht eingeloggt.");
      setSaving(false);
      return;
    }
    const { error: insErr } = await supabase.from("outfits").insert({
      user_id: user.id,
      name: name.trim() || null,
      item_ids: chosenItems.map((i) => i.id),
    });
    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return;
    }
    router.push("/outfits");
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        Du hast noch keine Kleidungsstücke. Füg erst etwas zum Kleiderschrank hinzu.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <input
        className="input"
        placeholder="Name des Outfits (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <PreviewBar items={chosenItems} />

      {slotsWithItems.map((slot) => (
        <section key={slot}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {slot}
          </h3>
          <div className="scroll-x -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {grouped[slot].map((item) => {
              const isActive = selected[slot] === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(slot, item.id)}
                  className={`relative aspect-square w-24 flex-shrink-0 overflow-hidden rounded-2xl border bg-card transition ${
                    isActive ? "border-fg ring-2 ring-fg/30" : "border-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.category}
                    className="h-full w-full object-contain p-1.5"
                  />
                  {isActive && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fg text-bg">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            onClick={save}
            disabled={saving || chosenItems.length === 0}
            className="btn btn-primary w-full"
          >
            {saving ? "Speichere…" : `Outfit speichern (${chosenItems.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewBar({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="card flex h-28 items-center justify-center text-sm text-muted">
        Wähl unten Teile aus
      </div>
    );
  }
  return (
    <div className="card flex h-28 items-center justify-center gap-2 p-2">
      {items.map((i) => (
        <div key={i.id} className="h-full w-20 overflow-hidden rounded-lg bg-border/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={i.image_url} alt={i.category} className="h-full w-full object-contain p-1" />
        </div>
      ))}
    </div>
  );
}
