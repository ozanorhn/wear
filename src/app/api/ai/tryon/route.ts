import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openaiJson } from "@/lib/openai";
import type { Item, Outfit } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type DescResult = { description: string };

const descSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    description: {
      type: "string",
      description: "Detaillierte englische Beschreibung des Outfits für einen Bildgenerator.",
    },
  },
  required: ["description"],
};

async function describeOutfit(items: Item[]): Promise<string> {
  const content = [
    {
      type: "text" as const,
      text: `Look at these clothing items. Write ONE detailed English description (3-5 sentences) of how a person would look wearing this complete outfit together. Describe each garment's color, material, cut, and style precisely. Be specific about how items combine. Output: { "description": "..." }`,
    },
    ...items.map((i) => ({
      type: "image_url" as const,
      image_url: { url: i.image_url },
    })),
  ];
  const result = await openaiJson<DescResult>(content, {
    name: "outfit_description",
    schema: descSchema,
  });
  return result.description;
}

async function generateImage(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY ist nicht gesetzt.");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",
      quality: "low",
      n: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI images ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (typeof b64 !== "string") throw new Error("Keine Bilddaten zurückbekommen.");
  return b64;
}

export async function POST(req: Request) {
  try {
    const { outfitId } = await req.json();
    if (!outfitId) return NextResponse.json({ error: "outfitId fehlt" }, { status: 400 });

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });

    const { data: outfit } = await supabase
      .from("outfits")
      .select("*")
      .eq("id", outfitId)
      .maybeSingle();
    if (!outfit) return NextResponse.json({ error: "Outfit nicht gefunden." }, { status: 404 });
    const o = outfit as Outfit;
    if (o.user_id !== user.id)
      return NextResponse.json({ error: "Nicht erlaubt." }, { status: 403 });

    const { data: itemsData } = await supabase
      .from("items")
      .select("*")
      .in("id", o.item_ids);
    const items = (itemsData ?? []) as Item[];
    if (items.length === 0)
      return NextResponse.json({ error: "Keine Kleidungsstücke." }, { status: 400 });

    const description = await describeOutfit(items);

    const prompt = `Editorial fashion photograph of a person wearing this outfit, shown from head to toe, full body in frame. Neutral studio background, soft natural lighting, sharp focus. The outfit: ${description}`;

    const b64 = await generateImage(prompt);
    const bytes = Buffer.from(b64, "base64");

    const filename = `${user.id}/tryon-${o.id}-${Date.now()}.png`;
    const { error: upErr } = await supabase.storage
      .from("clothes")
      .upload(filename, bytes, { contentType: "image/png", upsert: false });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("clothes").getPublicUrl(filename);

    await supabase.from("outfits").update({ tryon_url: pub.publicUrl }).eq("id", o.id);

    return NextResponse.json({ tryon_url: pub.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
