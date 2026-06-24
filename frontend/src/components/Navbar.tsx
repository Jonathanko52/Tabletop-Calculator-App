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
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="text-white font-bold text-lg mr-6 tracking-tight">
          ⚔ Tabletop Manager
        </span>
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={[
              "px-4 py-2 rounded text-sm font-medium transition-colors",
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
