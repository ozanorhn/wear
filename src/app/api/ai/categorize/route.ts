import { NextResponse } from "next/server";
import { openaiJson } from "@/lib/openai";
import { CATEGORIES, OCCASIONS, SEASONS } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string", description: "Kurzer deutscher Name, z.B. 'Blaues Oxford-Hemd'" },
    category: { type: "string", enum: [...CATEGORIES] },
    color: { type: "string", description: "Hauptfarbe auf Deutsch" },
    seasons: {
      type: "array",
      items: { type: "string", enum: [...SEASONS] },
    },
    occasions: {
      type: "array",
      items: { type: "string", enum: [...OCCASIONS] },
    },
  },
  required: ["name", "category", "color", "seasons", "occasions"],
};

type Result = {
  name: string;
  category: string;
  color: string;
  seasons: string[];
  occasions: string[];
};

export async function POST(req: Request) {
  try {
    const { dataUrl } = await req.json();
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return NextResponse.json({ error: "dataUrl fehlt" }, { status: 400 });
    }

    const result = await openaiJson<Result>(
      [
        {
          type: "text",
          text: `Analysiere das Kleidungsstück auf dem Foto und antworte als JSON.
- "category" aus: ${CATEGORIES.join(", ")}
- "seasons" 1-3 aus: ${SEASONS.join(", ")} (nimm "Ganzjährig" wenn unklar)
- "occasions" 1-3 aus: ${OCCASIONS.join(", ")}
- "name" kurz auf Deutsch (z.B. "Schwarzer Wollmantel")
- "color" dominante Farbe in einem deutschen Wort`,
        },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
      { name: "clothing_tags", schema },
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
