import Link from "next/link";
import { Settings, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { CATEGORIES, formatLastWorn, type Item, type Outfit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const supabase = createClient();
  const [{ data: itemsData }, { data: outfitsData }] = await Promise.all([
    supabase.from("items").select("*"),
    supabase.from("outfits").select("*"),
  ]);
  const items = (itemsData ?? []) as Item[];
  const outfits = (outfitsData ?? []) as Outfit[];

  const byCategory = CATEGORIES.map((c) => ({
    cat: c,
    count: items.filter((i) => i.category === c).length,
  })).filter((x) => x.count > 0);

  const byColor = Object.entries(
    items.reduce<Record<string, number>>((acc, i) => {
      const c = (i.color ?? "—").toLowerCase();
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const mostWornItems = [...items].sort((a, b) => b.wear_count - a.wear_count).slice(0, 5);
  const neverWorn = items.filter((i) => i.wear_count === 0);
  const mostWornOutfits = [...outfits].sort((a, b) => b.wear_count - a.wear_count).slice(0, 5);

  return (
    <>
      <TopBar
        title="Statistik"
        right={
          <Link
            href="/settings"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-border/40"
            aria-label="Einstellungen"
          >
            <Settings size={20} />
          </Link>
        }
      />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <Tile big={items.length} label="Teile im Schrank" />
          <Tile big={outfits.length} label="Outfits gespeichert" />
        </div>

        <Link href="/wardrobe/gaps" className="card mt-4 flex items-center gap-3 p-4 active:scale-[0.99]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Lücken-Analyse</div>
            <div className="text-xs text-muted">AI sagt dir, was fehlt</div>
          </div>
          <span aria-hidden className="text-muted">›</span>
        </Link>

        <Section title="Verteilung nach Kategorie">
          {byCategory.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {byCategory.map(({ cat, count }) => (
                <Bar key={cat} label={cat} value={count} max={items.length} />
              ))}
            </div>
          )}
        </Section>

        <Section title="Top-Farben">
          {byColor.length === 0 ? (
            <Empty />
          ) : (
            <div className="flex flex-wrap gap-2">
              {byColor.map(([color, n]) => (
                <span key={color} className="chip">
                  {color} · {n}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="Meistgetragene Teile">
          {mostWornItems.length === 0 || mostWornItems[0].wear_count === 0 ? (
            <Empty msg="Nichts getragen — drück 'Heute getragen' auf einem Outfit." />
          ) : (
            <div className="space-y-2">
              {mostWornItems.map((i) => (
                <Link
                  key={i.id}
                  href={`/wardrobe/${i.id}`}
                  className="card flex items-center gap-3 p-2 active:scale-[0.99]"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-border/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image_url} alt="" className="h-full w-full object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{i.name ?? i.category}</div>
                    <div className="truncate text-xs text-muted">
                      {formatLastWorn(i.last_worn_at)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{i.wear_count}×</div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Meistgetragene Outfits">
          {mostWornOutfits.length === 0 || mostWornOutfits[0].wear_count === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {mostWornOutfits.map((o) => (
                <Link
                  key={o.id}
                  href={`/outfits/${o.id}`}
                  className="card flex items-center justify-between p-3 active:scale-[0.99]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {o.name ?? `Outfit (${o.item_ids.length} Teile)`}
                    </div>
                    <div className="text-xs text-muted">{formatLastWorn(o.last_worn_at)}</div>
                  </div>
                  <div className="text-sm font-semibold">{o.wear_count}×</div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {neverWorn.length > 0 && (
          <Section title={`Noch nie getragen (${neverWorn.length})`}>
            <div className="scroll-x -mx-4 flex gap-3 overflow-x-auto px-4">
              {neverWorn.slice(0, 20).map((i) => (
                <Link
                  key={i.id}
                  href={`/wardrobe/${i.id}`}
                  className="w-24 flex-shrink-0 active:scale-[0.98]"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-border/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={i.image_url}
                      alt=""
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <div className="mt-1 truncate text-[11px] text-muted">{i.category}</div>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Tile({ big, label }: { big: number; label: string }) {
  return (
    <div className="card p-4">
      <div className="text-3xl font-semibold">{big}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/50">
        <div className="h-full bg-fg" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Empty({ msg }: { msg?: string }) {
  return (
    <p className="card p-4 text-center text-xs text-muted">
      {msg ?? "Noch keine Daten."}
    </p>
  );
}
