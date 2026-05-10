import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { WardrobeGrid } from "./WardrobeGrid";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WardrobePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  const items = (data ?? []) as Item[];

  return (
    <>
      <TopBar title="Kleiderschrank" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <WardrobeGrid items={items} />
        )}
      </main>
      <BottomNav />
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-card text-3xl">
        👕
      </div>
      <h2 className="text-lg font-semibold">Noch leer</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Füg dein erstes Kleidungsstück hinzu — Foto machen, Hintergrund wird automatisch entfernt.
      </p>
      <Link href="/wardrobe/add" className="btn btn-primary mt-6">
        Jetzt hinzufügen
      </Link>
    </div>
  );
}
