import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { WeekPlan } from "./WeekPlan";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WeekPage() {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*");
  const items = (data ?? []) as Item[];

  return (
    <>
      <TopBar title="Wochenplan" back="/outfits" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <WeekPlan items={items} />
      </main>
      <BottomNav />
    </>
  );
}
