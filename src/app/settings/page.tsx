import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { SettingsBody } from "./SettingsBody";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <TopBar title="Einstellungen" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <SettingsBody email={user?.email ?? ""} />
      </main>
      <BottomNav />
    </>
  );
}
