"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudSun, Dices, MapPin, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { randomOutfit } from "@/lib/outfit";
import { fetchWeather, getPosition, type WeatherInfo } from "@/lib/weather";
import { seasonForCondition, type Item } from "@/lib/types";

type Status = "asking" | "loading" | "ready" | "error";

export function WeatherOutfit({ items }: { items: Item[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("asking");
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [pick, setPick] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadWeather() {
    setStatus("loading");
    setError(null);
    try {
      const pos = await getPosition();
      const w = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
      setWeather(w);
      const seasons = seasonForCondition(w.condition);
      setPick(randomOutfit(items, seasons));
      setStatus("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Wetter konnte nicht geladen werden.";
      setError(msg);
      setStatus("error");
    }
  }

  useEffect(() => {
    // do not auto-request — wait for user gesture for permission
  }, []);

  function shuffle() {
    if (!weather) return;
    const seasons = seasonForCondition(weather.condition);
    setPick(randomOutfit(items, seasons));
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
      name: weather ? `${weather.summary} · ${Math.round(weather.tempC)}°C` : null,
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

  if (status === "asking") {
    return (
      <div className="mt-10 flex flex-col items-center text-center">
        <CloudSun size={40} className="text-muted" />
        <h2 className="mt-3 text-lg font-semibold">Vorschlag fürs heutige Wetter</h2>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Wir holen kurz dein Wetter (via Standort) und schlagen ein passendes Outfit vor.
        </p>
        <button onClick={loadWeather} className="btn btn-primary mt-6">
          <MapPin size={16} /> Standort verwenden
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <p className="mt-16 text-center text-sm text-muted">Lade Wetter…</p>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-10 flex flex-col items-center text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={loadWeather} className="btn btn-outline mt-4">
          Nochmal versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {weather && (
        <div className="card flex items-center justify-between p-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              {weather.condition}
            </div>
            <div className="mt-0.5 text-2xl font-semibold">
              {Math.round(weather.tempC)}°C
            </div>
            <div className="text-xs text-muted">{weather.summary}</div>
          </div>
          <CloudSun size={32} className="text-muted" />
        </div>
      )}

      <div className="card grid grid-cols-2 gap-2 p-3">
        {pick.length === 0 && (
          <p className="col-span-2 py-6 text-center text-sm text-muted">
            Keine passenden Teile gefunden — markier mehr Sachen mit „Saison&ldquo;.
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
          <Dices size={16} /> Neu
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
