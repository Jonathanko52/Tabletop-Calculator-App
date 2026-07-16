"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CalculatorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="10" y2="10" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
    <line x1="14" y1="14" x2="16" y2="14" />
    <line x1="8" y1="18" x2="10" y2="18" />
    <line x1="14" y1="18" x2="16" y2="18" />
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/army",        label: "Army Management", Icon: ShieldIcon },
  { href: "/effectiveness", label: "Calculator",    Icon: CalculatorIcon },
  { href: "/chapter",     label: "Chapter Manager", Icon: BookIcon },
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
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={[
              "px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2.5",
              pathname.startsWith(href)
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-700 hover:text-white",
            ].join(" ")}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
