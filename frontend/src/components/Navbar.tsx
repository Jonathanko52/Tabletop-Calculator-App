"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/army", label: "Army Management" },
  { href: "/effectiveness", label: "Unit Effectiveness" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 h-screen sticky top-0 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-gray-700">
        <span className="text-white font-bold text-lg tracking-tight">
          ⚔ Tabletop Manager
        </span>
      </div>
      <div className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={[
              "px-3 py-2 rounded text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white",
            ].join(" ")}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
