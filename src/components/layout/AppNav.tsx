"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/coach", label: "Coach" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3 sm:max-w-3xl lg:max-w-5xl">
        <Link href="/coach" className="font-semibold tracking-tight text-zinc-100">
          Hybrid<span className="text-emerald-400">Coach</span>
        </Link>
        <nav className="flex flex-1 justify-end gap-1 sm:gap-2">
          {links.map((l) => {
            const active =
              l.href === "/log"
                ? pathname.startsWith("/log")
                : l.href === "/settings"
                  ? pathname.startsWith("/settings")
                  : l.href === "/coach"
                    ? pathname === "/coach"
                    : pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
