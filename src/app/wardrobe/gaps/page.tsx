import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { GapsAnalyzer } from "./GapsAnalyzer";

export const dynamic = "force-dynamic";

export default function GapsPage() {
  return (
    <>
      <TopBar title="Lücken-Analyse" back="/stats" />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <GapsAnalyzer />
      </main>
      <BottomNav />
    </>
  );
}
