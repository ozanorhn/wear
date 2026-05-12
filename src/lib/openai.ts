const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

export type ChatContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export async function openaiJson<T>(
  content: ChatContent[],
  schema: { name: string; schema: object },
): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY ist nicht gesetzt.");

  const body = {
    model: MODEL,
    temperature: 0.4,
    messages: [{ role: "user", content }],
    response_format: {
      type: "json_schema",
      json_schema: { name: schema.name, schema: schema.schema, strict: true },
    },
  };

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("OpenAI hat keine Antwort geliefert.");
  return JSON.parse(text) as T;
}
