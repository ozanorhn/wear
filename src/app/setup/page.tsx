import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6 py-10">
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Setup unvollständig</h1>
            <p className="text-xs text-muted">Environment Variables fehlen</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          Diese App braucht zwei Supabase-Variablen, um zu funktionieren. Trag sie im Hosting-Dashboard (Netlify/Vercel) bei den Environment Variables ein und triggere einen neuen Deploy:
        </p>

        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
            <span className={hasSupabase ? "text-emerald-600" : "text-rose-500"}>
              {hasSupabase ? "✓" : "fehlt"}
            </span>
          </li>
          <li className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            <span className={hasSupabase ? "text-emerald-600" : "text-rose-500"}>
              {hasSupabase ? "✓" : "fehlt"}
            </span>
          </li>
          <li className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <code className="text-xs">OPENAI_API_KEY</code>
            <span className="text-muted">optional (für AI-Features)</span>
          </li>
        </ul>

        <p className="mt-4 text-xs text-muted">
          Werte findest du im Supabase-Dashboard unter <strong>Project Settings → API</strong>.
        </p>
      </div>
    </main>
  );
}
