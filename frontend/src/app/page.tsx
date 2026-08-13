import Link from "next/link";

const FEATURES = [
  {
    href: "/army",
    label: "Army Management",
    description: "Build and organise your armies, track unit status, and manage your roster.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.352-.218-2.65-.598-3.863A11.959 11.959 0 0115 6c-1.71 0-3.328-.38-4.77-1.036z" />
      </svg>
    ),
    accent: "indigo",
  },
  {
    href: "/effectiveness",
    label: "Calculator",
    description: "Calculate weapon effectiveness, damage output, and points efficiency for any unit.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.555 4.5 4.598V18a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18V4.598c0-1.043-.807-1.898-1.907-2.026A48.507 48.507 0 0012 2.25z" />
      </svg>
    ),
    accent: "violet",
  },
  {
    href: "/chapter",
    label: "Chapter Manager",
    description: "Narrative roster view for painted and ready units, nicknames, notes, and attachments.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    accent: "amber",
  },
];

const ACCENT_CLASSES: Record<string, { card: string; icon: string; arrow: string }> = {
  indigo: {
    card: "border-indigo-700/40 hover:border-indigo-500/60 hover:bg-indigo-900/20",
    icon: "bg-indigo-900/50 text-indigo-300",
    arrow: "text-indigo-400",
  },
  violet: {
    card: "border-violet-700/40 hover:border-violet-500/60 hover:bg-violet-900/20",
    icon: "bg-violet-900/50 text-violet-300",
    arrow: "text-violet-400",
  },
  amber: {
    card: "border-amber-700/40 hover:border-amber-500/60 hover:bg-amber-900/20",
    icon: "bg-amber-900/50 text-amber-300",
    arrow: "text-amber-400",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      {/* Hero */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">⚔ Tabletop Manager</h1>
        <p className="text-gray-400 text-base">
          Your Warhammer 40K army toolkit — build lists, calculate damage, and track your chapter.
        </p>
      </div>

      {/* Feature cards */}
      <div className="flex flex-col gap-4">
        {FEATURES.map(({ href, label, description, icon, accent }) => {
          const cls = ACCENT_CLASSES[accent];
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-start gap-4 rounded-xl border bg-gray-900 p-5 transition-colors ${cls.card}`}
            >
              <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${cls.icon}`}>
                {icon}
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{label}</div>
                <div className="text-gray-400 text-sm leading-relaxed">{description}</div>
              </div>
              <svg className={`w-4 h-4 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 ${cls.arrow}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
