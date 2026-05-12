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
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string" },
          name: { type: "string" },
          item_ids: { type: "array", items: { type: "string" } },
          reasoning: { type: "string" },
        },
        required: ["date", "name", "item_ids", "reasoning"],
      },
    },
  },
  required: ["days"],
};

type Result = {
  days: { date: string; name: string; item_ids: string[]; reasoning: string }[];
};

export async function POST(req: Request) {
  try {
    const { forecast } = await req.json();
    if (!Array.isArray(forecast)) {
      return NextResponse.json({ error: "forecast fehlt" }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });

    const { data, error } = await supabase.from("items").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const items = (data ?? []) as Item[];
    if (items.length < 4) {
      return NextResponse.json(
        { error: "Mindestens 4 Kleidungsstücke nötig." },
        { status: 400 },
      );
    }

    const itemList = items
      .map((i) =>
        [
          `id=${i.id}`,
          `kategorie=${i.category}`,
          i.color ? `farbe=${i.color}` : null,
          i.seasons.length ? `saison=${i.seasons.join("/")}` : null,
          i.occasions.length ? `anlass=${i.occasions.join("/")}` : null,
        ]
          .filter(Boolean)
          .join(", "),
      )
      .join("\n- ");

    const forecastList = forecast
      .map(
        (d: { date: string; tempMin: number; tempMax: number; summary: string }) =>
          `${d.date}: ${Math.round(d.tempMin)}-${Math.round(d.tempMax)}°C, ${d.summary}`,
      )
      .join("\n- ");

    const prompt = `Du bist ein Fashion-Stylist. Plane für jeden Tag der Woche ein Outfit aus dem verfügbaren Schrank, passend zum Wetter.

Wettervorhersage:
- ${forecastList}

Verfügbare Kleidungsstücke:
- ${itemList}

Regeln:
- EIN Outfit pro Tag (2-5 Teile).
- Verwende Teile auch mehrfach über die Woche, aber wechsle ab.
- Standard: Oberteil + Unterteil + Schuhe. Kalt → Jacke.
- Wähle nur IDs aus der Liste.
- Kurzer Outfit-Name auf Deutsch (z.B. "Casual Montag") und 1 Satz Begründung.`;

    const result = await openaiJson<Result>(
      [{ type: "text", text: prompt }],
      { name: "week_plan", schema },
    );

    const validIds = new Set(items.map((i) => i.id));
    const cleaned = result.days.map((d) => ({
      ...d,
      item_ids: d.item_ids.filter((id) => validIds.has(id)),
    }));

    return NextResponse.json({ days: cleaned });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
