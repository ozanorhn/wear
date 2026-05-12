"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Sparkles, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/types";

type Result = {
  pieces: Item[];
  name: string | null;
  reasoning: string;
};

export function AIOutfit({ items }: { items: Item[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      const pieces = json.item_ids
        .map((id: string) => items.find((i) => i.id === id))
        .filter((x: Item | undefined): x is Item => Boolean(x));
      setResult({ pieces, name: json.name ?? null, reasoning: json.reasoning ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI nicht erreichbar.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!result) return;
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
      name: result.name,
      item_ids: result.pieces.map((i) => i.id),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  if (items.length < 2) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        Du brauchst mindestens 2 Kleidungsstücke im Schrank, damit die AI etwas vorschlagen kann.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Anlass / Stimmung (optional)
        </label>
        <input
          className="input"
          placeholder="z. B. Date heute Abend, Büro, Brunch…"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
        />
        <button
          onClick={generate}
          disabled={loading}
          className="btn btn-primary mt-3 w-full"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> AI denkt nach…
            </>
          ) : (
            <>
              <Wand2 size={16} /> {result ? "Neu vorschlagen" : "Outfit vorschlagen"}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="card p-4 text-sm text-red-500">{error}</div>
      )}

      {result && (
        <>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-2 gap-2 p-3">
              {result.pieces.map((p) => (
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
            <div className="border-t border-border p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <Sparkles size={14} />
                {result.name ?? "AI-Outfit"}
              </div>
              <p className="text-xs leading-relaxed text-muted">{result.reasoning}</p>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving || saved}
            className="btn btn-outline w-full"
          >
            <Save size={16} />
            {saved ? "Gespeichert" : saving ? "Speichere…" : "Outfit speichern"}
          </button>
        </>
      )}
    </div>
  );
}
