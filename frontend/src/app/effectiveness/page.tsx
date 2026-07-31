"use client";

import { useState, useEffect } from "react";
import type { UnitTemplate, UnitEffectivenessOut, TemplateMatchupOut, FactionRankOut, CustomProfileOut } from "@/types";
import * as api from "@/lib/api";
import FactionUnitPicker from "@/components/effectiveness/FactionUnitPicker";
import DamageTable from "@/components/effectiveness/DamageTable";
import MatchupTable from "@/components/effectiveness/MatchupTable";
import RankingTable from "@/components/effectiveness/RankingTable";
import CustomProfileTable from "@/components/effectiveness/CustomProfileTable";

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

  // Templates (shared across tabs)
  const [unitTemplates, setUnitTemplates] = useState<UnitTemplate[]>([]);
  useEffect(() => { api.getUnitTemplates().then(setUnitTemplates).catch(() => {}); }, []);

  // Weapon profiles tab
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [profileResult, setProfileResult] = useState<UnitEffectivenessOut | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Custom profile (within Weapon Profiles tab)
  const [customT, setCustomT] = useState(4);
  const [customSave, setCustomSave] = useState(3);
  const [customInvuln, setCustomInvuln] = useState(7);
  const [customFnp, setCustomFnp] = useState(0);
  const [customResult, setCustomResult] = useState<CustomProfileOut | null>(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    if (!selectedTemplateId) { setCustomResult(null); return; }
    let cancelled = false;
    setLoadingCustom(true);
    api.getTemplateCustomProfile(selectedTemplateId, {
      toughness: customT,
      armor_save: customSave,
      invuln_save: customInvuln,
      fnp: customFnp,
    }).then((data) => { if (!cancelled) setCustomResult(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingCustom(false); });
    return () => { cancelled = true; };
  }, [selectedTemplateId, customT, customSave, customInvuln, customFnp]);

  // Match-up tab
  const [attackerTemplateId, setAttackerTemplateId] = useState<number | null>(null);
  const [defenderTemplateId, setDefenderTemplateId] = useState<number | null>(null);
  const [matchupResult, setMatchupResult] = useState<TemplateMatchupOut | null>(null);
  const [loadingMatchup, setLoadingMatchup] = useState(false);
  const [matchupError, setMatchupError] = useState<string | null>(null);

  // Efficiency ranking tab
  const [rankingFaction, setRankingFaction] = useState<string>("");
  const [rankingProfile, setRankingProfile] = useState<string>(PROFILES[1]);
  const [rankingResult, setRankingResult] = useState<FactionRankOut | null>(null);
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

          {/* Custom target profile */}
          {selectedTemplateId && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Custom Target</h2>
                <div className="flex-1 border-t border-gray-700" />
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-400">Toughness</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={customT}
                    onChange={(e) => setCustomT(Math.min(12, Math.max(1, Number(e.target.value))))}
                    className="input w-20"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-400">Armour Save</label>
                  <select value={customSave} onChange={(e) => setCustomSave(Number(e.target.value))} className="input">
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
                  <select value={customInvuln} onChange={(e) => setCustomInvuln(Number(e.target.value))} className="input">
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
                  <select value={customFnp} onChange={(e) => setCustomFnp(Number(e.target.value))} className="input">
                    <option value={0}>None</option>
                    <option value={4}>4+++</option>
                    <option value={5}>5+++</option>
                    <option value={6}>6+++</option>
                  </select>
                </div>
              </div>
              {loadingCustom && <div className="text-gray-400 text-sm">Calculating…</div>}
              {customResult && !loadingCustom && <CustomProfileTable result={customResult} />}
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
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">Faction</label>
              <select
                value={rankingFaction}
                onChange={(e) => { setRankingFaction(e.target.value); setRankingResult(null); }}
                className="input"
              >
                <option value="" disabled>— pick a faction —</option>
                {[...new Set(unitTemplates.map((t) => t.source))].sort().map((f) => (
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
              Pick a faction and target profile above, then click Rank Units.
            </div>
          )}
        </>
      )}
    </div>
  );
}
