"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, User } from "lucide-react";

export function TryOnPanel({ id, existing }: { id: string; existing: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(existing);

  async function generate() {
    if (
      !confirm(
        "Dieses AI-Bild kostet bei OpenAI etwa $0.04–0.10. Trotzdem generieren?",
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfitId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setUrl(json.tryon_url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generierung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <User size={14} /> Try-On Avatar
      </h2>

      {url ? (
        <div className="card overflow-hidden">
          <div className="relative aspect-[3/4] bg-border/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="AI Try-On" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <button
            onClick={generate}
            disabled={busy}
            className="btn btn-ghost w-full rounded-none border-t border-border"
          >
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Neu generieren…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Neu generieren (~$0.05)
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <User size={32} className="text-muted" />
          <p className="text-sm font-medium">Avatar mit diesem Outfit erzeugen</p>
          <p className="text-xs text-muted">
            AI rendert ein realistisches Bild deines Outfits. Kosten: ~$0.04–0.10 pro Bild.
          </p>
          <button onClick={generate} disabled={busy} className="btn btn-primary mt-2">
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generiere…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Avatar generieren
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
}
