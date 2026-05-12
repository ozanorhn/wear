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
    item_ids: {
      type: "array",
      items: { type: "string" },
      description: "IDs der ausgewählten Kleidungsstücke (nur aus der Liste).",
    },
    name: { type: "string", description: "Kurzer Outfit-Name auf Deutsch." },
    reasoning: { type: "string", description: "1-2 Sätze Begründung auf Deutsch." },
  },
  required: ["item_ids", "name", "reasoning"],
};

type Result = { item_ids: string[]; name: string; reasoning: string };

export async function POST(req: Request) {
  try {
    const { occasion } = await req.json().catch(() => ({}));
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });

    const { data, error } = await supabase.from("items").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const items = (data ?? []) as Item[];

    if (items.length < 2) {
      return NextResponse.json(
        { error: "Mindestens 2 Kleidungsstücke nötig." },
        { status: 400 },
      );
    }

    const itemList = items
      .map((i) => {
        const parts = [
          `id=${i.id}`,
          `kategorie=${i.category}`,
          i.name ? `name="${i.name}"` : null,
          i.color ? `farbe=${i.color}` : null,
          i.seasons.length ? `saison=${i.seasons.join("/")}` : null,
          i.occasions.length ? `anlass=${i.occasions.join("/")}` : null,
        ].filter(Boolean);
        return `- ${parts.join(", ")}`;
      })
      .join("\n");

    const occasionLine = occasion?.trim()
      ? `Anlass / Stimmung: "${occasion.trim()}".`
      : "Standard-Outfit für den Tag.";

    const prompt = `Du bist ein Fashion-Stylist. Stell aus den verfügbaren Kleidungsstücken EIN passendes Outfit zusammen.

${occasionLine}

Regeln:
- Wähle 2-5 Teile, die stilistisch harmonieren (Farben, Anlass, Saison).
- Standard: ein Oberteil (oder Kleid) + ein Unterteil + Schuhe. Jacke wenn passend.
- Verwende NUR die unten gelisteten IDs.
- Gib einen kurzen deutschen Outfit-Namen und 1-2 Sätze Begründung.

Verfügbare Kleidungsstücke:
${itemList}`;

    const result = await openaiJson<Result>(
      [{ type: "text", text: prompt }],
      { name: "outfit", schema },
    );

    const validIds = result.item_ids.filter((id) => items.some((i) => i.id === id));
    if (validIds.length === 0) {
      return NextResponse.json({ error: "AI hat keine passenden Teile gefunden." }, { status: 500 });
    }

    return NextResponse.json({
      item_ids: validIds,
      name: result.name ?? null,
      reasoning: result.reasoning ?? "",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
