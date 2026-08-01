"use client";

import { useState } from "react";
import type { UnitTemplate, FactionRankOut } from "@/types";
import * as api from "@/lib/api";
import RankingTable from "@/components/effectiveness/RankingTable";

const PROFILES = [
  "T3 5+",
  "T4 3+",
  "T4 3+ FNP",
  "T5 3+",
  "T6 3+",
  "T8 2+",
  "T9 3+",
  "T12 2+",
];

interface Props {
  templates: UnitTemplate[];
}

export default function RankingTab({ templates }: Props) {
  const [rankingFaction, setRankingFaction] = useState<string>("");
  const [rankingProfile, setRankingProfile] = useState<string>(PROFILES[1]);
  const [rankingResult, setRankingResult] = useState<FactionRankOut | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  async function handleRankUnits() {
    if (!rankingFaction) return;
    setRankingResult(null);
    setRankingError(null);
    setLoadingRanking(true);
    try {
      const data = await api.getFactionRanking(rankingFaction, rankingProfile);
      setRankingResult(data);
    } catch (e) {
      setRankingError(String(e));
    } finally {
      setLoadingRanking(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Faction</label>
          <select
            value={rankingFaction}
            onChange={(e) => { setRankingFaction(e.target.value); setRankingResult(null); }}
            className="input"
          >
            <option value="" disabled>— pick a faction —</option>
            {[...new Set(templates.map((t) => t.source))].sort().map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Target Profile</label>
          <select
            value={rankingProfile}
            onChange={(e) => { setRankingProfile(e.target.value); setRankingResult(null); }}
            className="input"
          >
            {PROFILES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRankUnits}
          disabled={!rankingFaction || loadingRanking}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingRanking ? "Ranking…" : "Rank Units"}
        </button>
      </div>

      {rankingError && (
        <p className="text-red-400 text-sm">{rankingError}</p>
      )}

      {rankingResult && !loadingRanking && (
        <RankingTable result={rankingResult} />
      )}

      {!rankingResult && !loadingRanking && !rankingError && (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
          Pick a faction and target profile above, then click Rank Units.
        </div>
      )}
    </>
  );
}
