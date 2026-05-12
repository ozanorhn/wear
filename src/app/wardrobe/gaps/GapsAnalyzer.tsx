"use client";

import { useState } from "react";
import { Loader2, Sparkles, TrendingUp, ShoppingBag } from "lucide-react";

type Gap = { item: string; why: string; priority: "hoch" | "mittel" | "niedrig" };
type Result = { summary: string; gaps: Gap[]; strengths: string[] };

export function GapsAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/gaps", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI nicht erreichbar.");
    } finally {
      setLoading(false);
    }
  }

  if (!result && !loading) {
    return (
      <div className="card flex flex-col items-center gap-3 p-6 text-center">
        <ShoppingBag size={32} className="text-muted" />
        <p className="text-sm font-medium">Was fehlt in deinem Schrank?</p>
        <p className="text-xs text-muted">
          AI analysiert dein Inventar und schlägt vor, welche Teile dein Schrank vielseitiger machen würden.
        </p>
        <button onClick={analyze} className="btn btn-primary mt-2">
          <Sparkles size={16} /> Lücken finden
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-12 flex flex-col items-center text-center">
        <Loader2 size={32} className="animate-spin text-muted" />
        <p className="mt-3 text-sm">AI durchsucht deinen Schrank…</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <Sparkles size={12} /> Stil-Profil
        </div>
        <p className="text-sm leading-relaxed">{result.summary}</p>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Was fehlt
        </h2>
        <div className="space-y-2">
          {result.gaps.map((g, i) => (
            <div key={i} className="card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-sm">{g.item}</div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    g.priority === "hoch"
                      ? "bg-rose-500/15 text-rose-500"
                      : g.priority === "mittel"
                      ? "bg-amber-500/15 text-amber-600"
                      : "bg-border/60 text-muted"
                  }`}
                >
                  {g.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{g.why}</p>
            </div>
          ))}
        </div>
      </section>

      {result.strengths.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            <TrendingUp size={12} /> Stärken
          </h2>
          <ul className="card space-y-1 p-3 text-sm">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button onClick={analyze} className="btn btn-outline w-full">
        <Sparkles size={16} /> Neu analysieren
      </button>
    </div>
  );
}
