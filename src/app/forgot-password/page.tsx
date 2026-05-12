"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setInfo(
      "Wir haben dir eine E-Mail geschickt. Klick den Link drin, um ein neues Passwort zu setzen.",
    );
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6">
      <Link
        href="/login"
        className="absolute left-3 top-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-border/40"
        aria-label="Zurück"
      >
        <ChevronLeft size={22} />
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Passwort vergessen?</h1>
        <p className="mt-2 text-sm text-muted">
          Gib deine E-Mail ein, wir schicken dir einen Reset-Link.
        </p>
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
        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Sende…" : "Reset-Link schicken"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Doch erinnert?{" "}
        <Link href="/login" className="font-medium text-fg underline">
          Einloggen
        </Link>
      </p>
    </main>
  );
}
