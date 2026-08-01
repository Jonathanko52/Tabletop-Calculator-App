"use client";

import { useState } from "react";
import type { UnitTemplate, FactionRankOut } from "@/types";
import * as api from "@/lib/api";
import RankingTable from "@/components/effectiveness/RankingTable";

interface Props {
  templates: UnitTemplate[];
}

export default function RankingTab({ templates }: Props) {
  const [rankingFaction, setRankingFaction] = useState<string>("");
  const [rankingT, setRankingT] = useState(4);
  const [rankingSave, setRankingSave] = useState(3);
  const [rankingInvuln, setRankingInvuln] = useState(7);
  const [rankingFnp, setRankingFnp] = useState(0);
  const [rankingResult, setRankingResult] = useState<FactionRankOut | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  async function handleRankUnits() {
    if (!rankingFaction) return;
    setRankingResult(null);
    setRankingError(null);
    setLoadingRanking(true);
    try {
      const data = await api.getFactionCustomRanking(rankingFaction, {
        toughness: rankingT,
        armor_save: rankingSave,
        invuln_save: rankingInvuln,
        fnp: rankingFnp,
      });
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
          <label className="text-xs font-medium text-gray-400">Toughness</label>
          <input
            type="number"
            min={1}
            max={12}
            value={rankingT}
            onChange={(e) => setRankingT(Math.min(12, Math.max(1, Number(e.target.value))))}
            className="input w-20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Armour Save</label>
          <select value={rankingSave} onChange={(e) => setRankingSave(Number(e.target.value))} className="input">
            <option value={7}>No Save</option>
            <option value={6}>6+</option>
            <option value={5}>5+</option>
            <option value={4}>4+</option>
            <option value={3}>3+</option>
            <option value={2}>2+</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Invuln Save</label>
          <select value={rankingInvuln} onChange={(e) => setRankingInvuln(Number(e.target.value))} className="input">
            <option value={7}>None</option>
            <option value={6}>6++</option>
            <option value={5}>5++</option>
            <option value={4}>4++</option>
            <option value={3}>3++</option>
            <option value={2}>2++</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Feel No Pain</label>
          <select value={rankingFnp} onChange={(e) => setRankingFnp(Number(e.target.value))} className="input">
            <option value={0}>None</option>
            <option value={4}>4+++</option>
            <option value={5}>5+++</option>
            <option value={6}>6+++</option>
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
