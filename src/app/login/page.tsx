"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/wardrobe");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">waer</h1>
        <p className="mt-2 text-sm text-muted">Dein virtueller Kleiderschrank.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="E-Mail"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Passwort"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Einen Moment…" : "Einloggen"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Noch kein Konto?{" "}
        <Link href="/signup" className="font-medium text-fg underline">
          Registrieren
        </Link>
      </p>
    </main>
  );
}
