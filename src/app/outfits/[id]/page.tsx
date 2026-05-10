import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { OutfitActions } from "./OutfitActions";
import type { Item, Outfit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OutfitPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: outfit } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!outfit) notFound();

  const o = outfit as Outfit;
  const { data: items } = await supabase.from("items").select("*").in("id", o.item_ids);
  const itemMap = new Map((items as Item[]).map((i) => [i.id, i]));
  const ordered = o.item_ids.map((id) => itemMap.get(id)).filter((x): x is Item => Boolean(x));

  return (
    <>
      <TopBar title={o.name ?? "Outfit"} back="/outfits" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <div className="card grid grid-cols-2 gap-2 p-3">
          {ordered.map((p) => (
            <Link
              key={p.id}
              href={`/wardrobe/${p.id}`}
              className="relative aspect-square overflow-hidden rounded-xl bg-border/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt={p.category}
                className="absolute inset-0 h-full w-full object-contain p-2"
              />
              <span className="absolute bottom-1 left-1 rounded-full bg-fg/85 px-2 py-0.5 text-[10px] font-medium text-bg">
                {p.category}
              </span>
            </Link>
          ))}
        </div>

        <OutfitActions id={o.id} />
      </main>
      <BottomNav />
    </>
  );
}
