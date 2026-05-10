"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/wardrobe");
      router.refresh();
    } else {
      setInfo("Konto erstellt. Bitte E-Mail bestätigen, dann einloggen.");
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Konto erstellen</h1>
        <p className="mt-2 text-sm text-muted">Leg deinen Kleiderschrank an.</p>
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
          minLength={6}
          autoComplete="new-password"
          placeholder="Passwort (min. 6 Zeichen)"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Einen Moment…" : "Registrieren"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Schon ein Konto?{" "}
        <Link href="/login" className="font-medium text-fg underline">
          Einloggen
        </Link>
      </p>
    </main>
  );
}
