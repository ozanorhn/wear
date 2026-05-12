"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase setzt nach dem Klick auf den E-Mail-Link eine Recovery-Session.
    // Wir warten kurz darauf, damit wir wissen, ob wir hier überhaupt sein dürfen.
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError(
          "Reset-Link ungültig oder abgelaufen. Bitte fordere einen neuen Link an.",
        );
      }
      setReady(true);
    });
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen haben.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/wardrobe");
      router.refresh();
    }, 1200);
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Neues Passwort</h1>
        <p className="mt-2 text-sm text-muted">
          Wähl ein neues Passwort für deinen Account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Neues Passwort"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!ready || success}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Wiederholen"
          className="input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={!ready || success}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-600">Passwort geändert. Leite weiter…</p>
        )}
        <button
          type="submit"
          disabled={loading || !ready || success}
          className="btn btn-primary w-full"
        >
          {loading ? "Speichere…" : "Passwort speichern"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Hat nicht geklappt?{" "}
        <Link href="/forgot-password" className="font-medium text-fg underline">
          Neuen Link anfordern
        </Link>
      </p>
    </main>
  );
}
