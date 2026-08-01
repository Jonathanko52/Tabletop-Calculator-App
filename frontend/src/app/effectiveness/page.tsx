"use client";

import { useState, useEffect } from "react";
import type { UnitTemplate } from "@/types";
import * as api from "@/lib/api";
import WeaponProfilesTab from "@/components/effectiveness/WeaponProfilesTab";
import MatchupTab from "@/components/effectiveness/MatchupTab";
import RankingTab from "@/components/effectiveness/RankingTab";

type Tab = "profiles" | "matchup" | "ranking";

const TAB_LABELS: Record<Tab, string> = {
  profiles: "Weapon Profiles",
  matchup: "Unit Match-up",
  ranking: "Efficiency Ranking",
};

export default function EffectivenessPage() {
  const [tab, setTab] = useState<Tab>("profiles");
  const [unitTemplates, setUnitTemplates] = useState<UnitTemplate[]>([]);

  useEffect(() => { api.getUnitTemplates().then(setUnitTemplates).catch(() => {}); }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Calculator</h1>
        <p className="text-gray-400 text-sm">
          Damage output and points efficiency for your units.
        </p>
      </div>

      <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1 w-fit">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "profiles" && <WeaponProfilesTab templates={unitTemplates} />}
      {tab === "matchup" && <MatchupTab templates={unitTemplates} />}
      {tab === "ranking" && <RankingTab templates={unitTemplates} />}
    </div>
  );
}
