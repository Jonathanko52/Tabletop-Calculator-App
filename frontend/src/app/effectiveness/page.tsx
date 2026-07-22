"use client";

import { useState, useEffect } from "react";
import type { UnitTemplate, UnitEffectivenessOut, TemplateMatchupOut, EfficiencyRankOut } from "@/types";
import * as api from "@/lib/api";
import { useArmies } from "@/hooks/useArmies";
import FactionUnitPicker from "@/components/effectiveness/FactionUnitPicker";
import DamageTable from "@/components/effectiveness/DamageTable";
import MatchupSelector from "@/components/effectiveness/MatchupSelector";
import MatchupTable from "@/components/effectiveness/MatchupTable";
import RankingTable from "@/components/effectiveness/RankingTable";

type Tab = "profiles" | "matchup" | "ranking";

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

const TAB_LABELS: Record<Tab, string> = {
  profiles: "Weapon Profiles",
  matchup: "Unit Match-up",
  ranking: "Efficiency Ranking",
};

export default function EffectivenessPage() {
  const [tab, setTab] = useState<Tab>("profiles");

  // Shared
  const { armies, loading: loadingArmies, error, reload: loadArmies } = useArmies();

  // Templates (shared across tabs)
  const [unitTemplates, setUnitTemplates] = useState<UnitTemplate[]>([]);
  useEffect(() => { api.getUnitTemplates().then(setUnitTemplates).catch(() => {}); }, []);

  // Weapon profiles tab
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [profileResult, setProfileResult] = useState<UnitEffectivenessOut | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Match-up tab
  const [attackerTemplateId, setAttackerTemplateId] = useState<number | null>(null);
  const [defenderTemplateId, setDefenderTemplateId] = useState<number | null>(null);
  const [matchupResult, setMatchupResult] = useState<TemplateMatchupOut | null>(null);
  const [loadingMatchup, setLoadingMatchup] = useState(false);
  const [matchupError, setMatchupError] = useState<string | null>(null);

  // Efficiency ranking tab
  const [rankingArmyId, setRankingArmyId] = useState<number | null>(null);
  const [rankingProfile, setRankingProfile] = useState<string>(PROFILES[1]); // default: T4 3+
  const [rankingResult, setRankingResult] = useState<EfficiencyRankOut | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  async function handleSelectTemplate(templateId: number) {
    setSelectedTemplateId(templateId);
    setProfileResult(null);
    setCalcError(null);
    setLoadingCalc(true);
    try {
      const data = await api.getTemplateEffectiveness(templateId);
      setProfileResult(data);
    } catch (e) {
      setCalcError(String(e));
    } finally {
      setLoadingCalc(false);
    }
  }

  async function handleCalculateMatchup() {
    if (attackerTemplateId === null || defenderTemplateId === null) return;
    setMatchupResult(null);
    setMatchupError(null);
    setLoadingMatchup(true);
    try {
      const data = await api.getTemplateMatchup(attackerTemplateId, defenderTemplateId);
      setMatchupResult(data);
    } catch (e) {
      setMatchupError(String(e));
    } finally {
      setLoadingMatchup(false);
    }
  }

  async function handleRankUnits() {
    if (rankingArmyId === null) return;
    setRankingResult(null);
    setRankingError(null);
    setLoadingRanking(true);
    try {
      const data = await api.getArmyRanking(rankingArmyId, rankingProfile);
      setRankingResult(data);
    } catch (e) {
      setRankingError(String(e));
    } finally {
      setLoadingRanking(false);
    }
  }

  if (loadingArmies) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    );
  }

  if (error && !profileResult) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-400 text-sm">{error}</p>
        <p className="text-gray-500 text-xs">Make sure FastAPI is running on port 8000.</p>
        <button onClick={loadArmies} className="btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Calculator</h1>
        <p className="text-gray-400 text-sm">
          Damage output and points efficiency for your units.
        </p>
      </div>

      {/* Tab bar */}
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

      {/* Weapon Profiles tab */}
      {tab === "profiles" && (
        <>
          <FactionUnitPicker
            label="Select Unit"
            templates={unitTemplates}
            selectedId={selectedTemplateId}
            onChange={handleSelectTemplate}
          />

          {loadingCalc && (
            <div className="text-gray-400 text-sm">Calculating…</div>
          )}

          {calcError && profileResult === null && !loadingCalc && (
            <p className="text-red-400 text-sm">{calcError}</p>
          )}

          {profileResult && !loadingCalc && (
            profileResult.results.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
                This unit has no weapons.
              </div>
            ) : (
              <DamageTable data={profileResult} />
            )
          )}

          {!selectedTemplateId && !loadingCalc && (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
              Select a unit above to calculate its damage output against all target profiles.
            </div>
          )}
        </>
      )}

      {/* Unit Match-up tab */}
      {tab === "matchup" && (
        <>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FactionUnitPicker
                label="Attacker"
                templates={unitTemplates}
                selectedId={attackerTemplateId}
                onChange={setAttackerTemplateId}
              />
              <FactionUnitPicker
                label="Defender"
                templates={unitTemplates}
                selectedId={defenderTemplateId}
                onChange={setDefenderTemplateId}
              />
            </div>
            <button
              onClick={handleCalculateMatchup}
              disabled={attackerTemplateId === null || defenderTemplateId === null || loadingMatchup}
              className="btn-primary w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMatchup ? "Calculating…" : "Calculate Match-up"}
            </button>
          </div>

          {loadingMatchup && (
            <div className="text-gray-400 text-sm">Calculating…</div>
          )}

          {matchupError && (
            <p className="text-red-400 text-sm">{matchupError}</p>
          )}

          {matchupResult && !loadingMatchup && (
            <MatchupTable result={matchupResult} />
          )}

          {!matchupResult && !loadingMatchup && !matchupError && (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
              Pick an attacker and defender above, then click Calculate Match-up.
            </div>
          )}
        </>
      )}

      {/* Efficiency Ranking tab */}
      {tab === "ranking" && (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Army</label>
                {armies.length === 0 ? (
                  <p className="text-gray-500 text-sm">No armies found.</p>
                ) : (
                  <select
                    value={rankingArmyId ?? ""}
                    onChange={(e) => {
                      setRankingArmyId(Number(e.target.value));
                      setRankingResult(null);
                    }}
                    className="input"
                  >
                    <option value="" disabled>— pick an army —</option>
                    {armies.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.faction})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Target Profile</label>
                <select
                  value={rankingProfile}
                  onChange={(e) => {
                    setRankingProfile(e.target.value);
                    setRankingResult(null);
                  }}
                  className="input"
                >
                  {PROFILES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRankUnits}
                disabled={rankingArmyId === null || loadingRanking}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingRanking ? "Ranking…" : "Rank Units"}
              </button>
            </div>
          </div>

          {loadingRanking && (
            <div className="text-gray-400 text-sm">Calculating…</div>
          )}

          {rankingError && (
            <p className="text-red-400 text-sm">{rankingError}</p>
          )}

          {rankingResult && !loadingRanking && (
            <RankingTable result={rankingResult} />
          )}

          {!rankingResult && !loadingRanking && !rankingError && (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
              Pick an army and target profile above, then click Rank Units.
            </div>
          )}
        </>
      )}
    </div>
  );
}
