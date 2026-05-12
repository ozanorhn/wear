import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openaiJson } from "@/lib/openai";
import type { Item } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description: "1-2 Sätze auf Deutsch: dein Stil-Profil basierend auf dem Schrank.",
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          item: { type: "string", description: "Was fehlt, z.B. 'Schwarze Chino-Hose'" },
          why: { type: "string", description: "1 Satz Begründung." },
          priority: { type: "string", enum: ["hoch", "mittel", "niedrig"] },
        },
        required: ["item", "why", "priority"],
      },
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "2-3 Sachen, die der Schrank gut abdeckt.",
    },
  },
  required: ["summary", "gaps", "strengths"],
};

type Result = {
  summary: string;
  gaps: { item: string; why: string; priority: "hoch" | "mittel" | "niedrig" }[];
  strengths: string[];
};

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });

    const { data, error } = await supabase.from("items").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const items = (data ?? []) as Item[];

    if (items.length < 3) {
      return NextResponse.json(
        { error: "Mindestens 3 Kleidungsstücke nötig für eine Analyse." },
        { status: 400 },
      );
    }

    const inventory = items
      .map((i) =>
        [
          i.category,
          i.color,
          i.seasons.join("/"),
          i.occasions.join("/"),
          i.name,
        ]
          .filter(Boolean)
          .join(" · "),
      )
      .join("\n- ");

    const prompt = `Du bist ein Fashion-Stylist. Analysiere diesen Kleiderschrank und finde Lücken.

Inventar (${items.length} Teile):
- ${inventory}

Gib zurück:
- "summary": kurzes Stil-Profil
- "gaps": 3-6 konkrete Vorschläge was fehlt (Item, Begründung, Priorität)
- "strengths": 2-3 Bereiche, die gut abgedeckt sind

Sei spezifisch (z.B. "Schwarze Chino-Hose" statt "eine Hose"). Auf Deutsch.`;

    const result = await openaiJson<Result>(
      [{ type: "text", text: prompt }],
      { name: "wardrobe_gaps", schema },
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
