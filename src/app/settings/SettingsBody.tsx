"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SettingsBody({ email }: { email: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="card p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">
          Eingeloggt als
        </div>
        <div className="mt-1 truncate text-sm font-medium">{email}</div>
      </section>

      <button onClick={toggleDark} className="card flex w-full items-center justify-between p-4">
        <span className="flex items-center gap-3 text-sm font-medium">
          {dark ? <Moon size={18} /> : <Sun size={18} />}
          {dark ? "Dunkel" : "Hell"}
        </span>
        <span className="text-xs text-muted">Tippen zum Wechseln</span>
      </button>

      <button onClick={logout} className="btn btn-outline w-full">
        <LogOut size={16} />
        Ausloggen
      </button>

      <p className="pt-4 text-center text-xs text-muted">
        waer · dein virtueller Kleiderschrank
      </p>
    </div>
  );
}
