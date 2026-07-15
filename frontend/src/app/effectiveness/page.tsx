"use client";

import { useEffect, useState, useCallback } from "react";
import type { Army, UnitEffectivenessOut, MatchupOut } from "@/types";
import * as api from "@/lib/api";
import UnitSelector from "@/components/effectiveness/UnitSelector";
import DamageTable from "@/components/effectiveness/DamageTable";
import MatchupSelector from "@/components/effectiveness/MatchupSelector";
import MatchupTable from "@/components/effectiveness/MatchupTable";

type Tab = "profiles" | "matchup";

export default function EffectivenessPage() {
  const [tab, setTab] = useState<Tab>("profiles");

  // Shared
  const [armies, setArmies] = useState<Army[]>([]);
  const [loadingArmies, setLoadingArmies] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Weapon profiles tab
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [profileResult, setProfileResult] = useState<UnitEffectivenessOut | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);

  // Match-up tab
  const [attackerId, setAttackerId] = useState<number | null>(null);
  const [defenderId, setDefenderId] = useState<number | null>(null);
  const [matchupResult, setMatchupResult] = useState<MatchupOut | null>(null);
  const [loadingMatchup, setLoadingMatchup] = useState(false);
  const [matchupError, setMatchupError] = useState<string | null>(null);

  const loadArmies = useCallback(async () => {
    try {
      const data = await api.getArmies();
      setArmies(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingArmies(false);
    }
  }, []);

  useEffect(() => {
    loadArmies();
  }, [loadArmies]);

  async function handleSelectUnit(unitId: number) {
    setSelectedUnitId(unitId);
    setProfileResult(null);
    setError(null);
    setLoadingCalc(true);
    try {
      const data = await api.getUnitEffectiveness(unitId);
      setProfileResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingCalc(false);
    }
  }

  async function handleCalculateMatchup() {
    if (attackerId === null || defenderId === null) return;
    setMatchupResult(null);
    setMatchupError(null);
    setLoadingMatchup(true);
    try {
      const data = await api.getMatchup(attackerId, defenderId);
      setMatchupResult(data);
    } catch (e) {
      setMatchupError(String(e));
    } finally {
      setLoadingMatchup(false);
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
        {(["profiles", "matchup"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t === "profiles" ? "Weapon Profiles" : "Unit Match-up"}
          </button>
        ))}
      </div>

      {/* Weapon Profiles tab */}
      {tab === "profiles" && (
        <>
          <UnitSelector
            armies={armies}
            selectedUnitId={selectedUnitId}
            onChange={handleSelectUnit}
          />

          {loadingCalc && (
            <div className="text-gray-400 text-sm">Calculating…</div>
          )}

          {error && profileResult === null && !loadingCalc && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {profileResult && !loadingCalc && (
            profileResult.results.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
                This unit has no weapons. Add weapons on the Army Management page to see calculations.
              </div>
            ) : (
              <DamageTable data={profileResult} />
            )
          )}

          {!selectedUnitId && !loadingCalc && (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
              Select a unit above to calculate its damage output against all target profiles.
            </div>
          )}
        </>
      )}

      {/* Unit Match-up tab */}
      {tab === "matchup" && (
        <>
          <MatchupSelector
            armies={armies}
            attackerId={attackerId}
            defenderId={defenderId}
            onAttackerChange={setAttackerId}
            onDefenderChange={setDefenderId}
            onCalculate={handleCalculateMatchup}
            loading={loadingMatchup}
          />

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
    </div>
  );
}
