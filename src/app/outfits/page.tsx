import Link from "next/link";
import { Calendar, CloudSun, Dices, Plus, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import type { Item, Outfit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  const supabase = createClient();
  const [{ data: outfitsData }, { data: itemsData }] = await Promise.all([
    supabase.from("outfits").select("*").order("created_at", { ascending: false }),
    supabase.from("items").select("*"),
  ]);

  const outfits = ((outfitsData ?? []) as Outfit[]).sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const items = (itemsData ?? []) as Item[];
  const itemById = new Map(items.map((i) => [i.id, i]));

  return (
    <>
      <TopBar title="Outfits" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <ActionTile href="/outfits/ai" icon={<Wand2 size={22} />} label="AI-Vorschlag" highlight />
          <ActionTile href="/outfits/week" icon={<Calendar size={22} />} label="Wochenplan" />
          <ActionTile href="/outfits/weather" icon={<CloudSun size={22} />} label="Wetter" />
          <ActionTile href="/outfits/random" icon={<Dices size={22} />} label="Zufall" />
          <ActionTile href="/outfits/create" icon={<Plus size={22} />} label="Manuell" />
        </div>

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-muted">
          Gespeichert
        </h2>

        {outfits.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
            <p className="text-sm font-medium">Noch keine Outfits gespeichert.</p>
            <p className="text-xs text-muted">
              Erstell dein erstes Outfit oder lass dir eins vorschlagen.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {outfits.map((o) => {
              const pieces = o.item_ids
                .map((id) => itemById.get(id))
                .filter((x): x is Item => Boolean(x));
              return (
                <Link
                  key={o.id}
                  href={`/outfits/${o.id}`}
                  className="card flex items-center gap-3 p-3 active:scale-[0.99]"
                >
                  <div className="flex flex-shrink-0 gap-1">
                    {pieces.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="h-14 w-14 overflow-hidden rounded-lg bg-border/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image_url}
                          alt={p.category}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {o.is_favorite && <span className="text-rose-500">❤</span>}
                      {o.name ?? `Outfit · ${pieces.length} Teile`}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {o.wear_count > 0 ? `${o.wear_count}× getragen · ` : ""}
                      {pieces.map((p) => p.category).join(" · ")}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function ActionTile({
  href,
  icon,
  label,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex aspect-[2/1] flex-col items-center justify-center gap-2 rounded-2xl border transition active:scale-[0.98] ${
        highlight
          ? "border-fg bg-fg text-bg"
          : "border-border bg-card text-fg"
      }`}
    >
      <div>{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
