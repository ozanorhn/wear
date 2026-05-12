import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ItemActions } from "./ItemActions";
import { formatLastWorn, type Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();
  const item = data as Item;

  return (
    <>
      <TopBar title={item.name ?? item.category} back="/wardrobe" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <div className="card overflow-hidden">
          <div className="relative aspect-square bg-border/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.name ?? item.category}
              className="absolute inset-0 h-full w-full object-contain p-4"
            />
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Kategorie" value={item.category} />
          {item.color && <Row label="Farbe" value={item.color} />}
          {item.seasons.length > 0 && <Row label="Saison" value={item.seasons.join(", ")} />}
          {item.occasions.length > 0 && <Row label="Anlass" value={item.occasions.join(", ")} />}
          <Row label="Zuletzt getragen" value={formatLastWorn(item.last_worn_at)} />
          <Row label="Wie oft getragen" value={`${item.wear_count}×`} />
          {item.notes && <Row label="Notizen" value={item.notes} />}
        </dl>

        <ItemActions
          id={item.id}
          imageUrl={item.image_url}
          isFavorite={item.is_favorite}
        />
      </main>
      <BottomNav />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
