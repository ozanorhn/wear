"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { getRemoveBackground } from "@/lib/bgRemoval";
import { CATEGORIES, OCCASIONS, SEASONS, type Category, type Occasion, type Season } from "@/lib/types";

type Stage = "pick" | "processing" | "form";

export default function AddItemPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("pick");
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingMsg, setProcessingMsg] = useState("Lade Modell…");

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("T-Shirt");
  const [color, setColor] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStage("processing");
    setError(null);
    setProcessingMsg("Lade Modell (einmalig, dauert beim ersten Mal kurz)…");

    try {
      const removeBackground = await getRemoveBackground();
      setProcessingMsg("Entferne Hintergrund…");
      const blob = await removeBackground(file);
      setProcessedBlob(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setStage("form");
    } catch (err) {
      console.error(err);
      setError("Konnte Hintergrund nicht entfernen. Versuch's nochmal oder benutz ein anderes Foto.");
      setStage("pick");
    }
  }

  function toggle<T extends string>(value: T, set: T[], setter: (v: T[]) => void) {
    if (set.includes(value)) setter(set.filter((s) => s !== value));
    else setter([...set, value]);
  }

  async function onSave() {
    if (!processedBlob) return;
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt.");

      const filename = `${user.id}/${crypto.randomUUID()}.png`;
      const { error: upErr } = await supabase.storage
        .from("clothes")
        .upload(filename, processedBlob, { contentType: "image/png", upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("clothes").getPublicUrl(filename);

      const { error: insErr } = await supabase.from("items").insert({
        user_id: user.id,
        name: name.trim() || null,
        category,
        color: color.trim() || null,
        seasons,
        occasions,
        notes: notes.trim() || null,
        image_url: pub.publicUrl,
      });
      if (insErr) throw insErr;

      router.push("/wardrobe");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
      setError(message);
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar title="Neues Kleidungsstück" back="/wardrobe" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        {stage === "pick" && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => fileInput.current?.click()}
              className="flex aspect-square w-full max-w-xs flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card text-muted active:scale-[0.99]"
            >
              <Camera size={36} />
              <span className="text-sm font-medium">Foto aufnehmen</span>
              <span className="px-6 text-center text-xs">
                Tipp: heller, gleichmäßiger Hintergrund
              </span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFileChosen}
            />
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </div>
        )}

        {stage === "processing" && (
          <div className="mt-16 flex flex-col items-center text-center">
            <Loader2 size={36} className="animate-spin text-muted" />
            <p className="mt-4 text-sm font-medium">{processingMsg}</p>
            <p className="mt-1 text-xs text-muted">
              Das passiert direkt auf deinem Handy — keine Daten gehen woanders hin.
            </p>
          </div>
        )}

        {stage === "form" && previewUrl && (
          <div className="space-y-5">
            <div className="card relative aspect-square overflow-hidden bg-border/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Vorschau"
                className="absolute inset-0 h-full w-full object-contain p-4"
              />
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-fg/85 px-2 py-1 text-[10px] font-medium text-bg">
                <Sparkles size={10} /> Hintergrund entfernt
              </span>
            </div>

            <Field label="Name (optional)">
              <input
                className="input"
                placeholder="z. B. Lieblings-T-Shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field label="Kategorie">
              <div className="scroll-x -mx-4 flex gap-2 overflow-x-auto px-4">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`chip whitespace-nowrap ${category === c ? "chip-active" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Farbe (optional)">
              <input
                className="input"
                placeholder="z. B. schwarz, blau, beige"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </Field>

            <Field label="Saison">
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s, seasons, setSeasons)}
                    className={`chip ${seasons.includes(s) ? "chip-active" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Anlass">
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggle(o, occasions, setOccasions)}
                    className={`chip ${occasions.includes(o) ? "chip-active" : ""}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Notizen (optional)">
              <textarea
                className="input min-h-[80px]"
                placeholder="Eigene Tags, Erinnerungen…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="sticky bottom-20 -mx-4 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur">
              <button onClick={onSave} disabled={saving} className="btn btn-primary w-full">
                {saving ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
