"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CloudSun, Loader2, MapPin, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchWeekForecast, getPosition, type DailyForecast } from "@/lib/weather";
import type { Item } from "@/lib/types";

type Day = { date: string; name: string; item_ids: string[]; reasoning: string };

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function WeekPlan({ items }: { items: Item[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [stage, setStage] = useState<"start" | "loading" | "ready" | "error">("start");
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [savingAll, setSavingAll] = useState(false);
  const [saved, setSaved] = useState(false);

  const itemById = new Map(items.map((i) => [i.id, i]));

  async function generate() {
    setStage("loading");
    setError(null);
    try {
      const pos = await getPosition();
      const fc = await fetchWeekForecast(pos.coords.latitude, pos.coords.longitude);
      setForecast(fc);
      const res = await fetch("/api/ai/week-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forecast: fc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDays(json.days ?? []);
      setStage("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wochenplan fehlgeschlagen.");
      setStage("error");
    }
  }

  async function saveAll() {
    setSavingAll(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSavingAll(false);
      return;
    }
    const rows = days
      .filter((d) => d.item_ids.length > 0)
      .map((d) => ({
        user_id: user.id,
        name: d.name,
        item_ids: d.item_ids,
      }));
    if (rows.length > 0) {
      await supabase.from("outfits").insert(rows);
    }
    setSaved(true);
    setSavingAll(false);
    router.refresh();
  }

  if (items.length < 4) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        Du brauchst mindestens 4 Kleidungsstücke für einen Wochenplan.
      </p>
    );
  }

  if (stage === "start") {
    return (
      <div className="card flex flex-col items-center gap-3 p-6 text-center">
        <Calendar size={32} className="text-muted" />
        <p className="text-sm font-medium">Wochenplan generieren</p>
        <p className="text-xs text-muted">
          AI plant für jeden Tag der nächsten 7 Tage ein passendes Outfit — basierend auf der Wettervorhersage für deinen Standort.
        </p>
        <button onClick={generate} className="btn btn-primary mt-2">
          <MapPin size={16} /> Standort + Wochenplan
        </button>
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div className="mt-12 flex flex-col items-center text-center">
        <Loader2 size={32} className="animate-spin text-muted" />
        <p className="mt-3 text-sm">Hole Wetter und plane Outfits…</p>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="mt-10 flex flex-col items-center text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={generate} className="btn btn-outline mt-4">
          Nochmal versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {days.map((d, i) => {
        const fc = forecast[i];
        const pieces = d.item_ids
          .map((id) => itemById.get(id))
          .filter((x): x is Item => Boolean(x));
        const weekday = WEEKDAYS[new Date(d.date).getDay()];
        return (
          <div key={d.date} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {weekday} · {new Date(d.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                </div>
                <div className="text-sm font-medium">{d.name}</div>
              </div>
              {fc && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <CloudSun size={14} />
                  {Math.round(fc.tempMin)}-{Math.round(fc.tempMax)}°
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-2">
              {pieces.map((p) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-lg bg-border/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt={p.category} className="h-full w-full object-contain p-1" />
                </div>
              ))}
            </div>
            <p className="border-t border-border p-3 text-xs text-muted">{d.reasoning}</p>
          </div>
        );
      })}

      <button
        onClick={saveAll}
        disabled={savingAll || saved}
        className="btn btn-primary w-full"
      >
        <Save size={16} />
        {saved ? "Alle gespeichert ✓" : savingAll ? "Speichere…" : "Alle 7 Outfits speichern"}
      </button>
    </div>
  );
}
