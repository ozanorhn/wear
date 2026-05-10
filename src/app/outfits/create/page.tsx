import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { OutfitBuilder } from "./OutfitBuilder";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CreateOutfitPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  const items = (data ?? []) as Item[];

  return (
    <>
      <TopBar title="Outfit erstellen" back="/outfits" />
      <main className="mx-auto max-w-md px-4 pb-32 pt-3">
        <OutfitBuilder items={items} />
      </main>
      <BottomNav />
    </>
  );
}
