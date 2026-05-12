"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Sparkles, Plus, BarChart3 } from "lucide-react";

const links = [
  { href: "/wardrobe", icon: Shirt, label: "Schrank" },
  { href: "/outfits", icon: Sparkles, label: "Outfits" },
  { href: "/wardrobe/add", icon: Plus, label: "Neu", primary: true },
  { href: "/stats", icon: BarChart3, label: "Stats" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {links.map(({ href, icon: Icon, label, primary }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          if (primary) {
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-fg text-bg shadow-lg active:scale-95"
                  aria-label={label}
                >
                  <Icon size={22} />
                </Link>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition ${
                  active ? "text-fg" : "text-muted"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
