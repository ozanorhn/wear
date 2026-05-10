"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function TopBar({
  title,
  back,
  right,
}: {
  title: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-3">
        <div className="flex w-10 items-center">
          {back && (
            <Link
              href={back}
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-border/40"
              aria-label="Zurück"
            >
              <ChevronLeft size={22} />
            </Link>
          )}
        </div>
        <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
        <div className="flex w-10 items-center justify-end">{right}</div>
      </div>
    </header>
  );
}
