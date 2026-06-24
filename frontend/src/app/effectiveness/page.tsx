"use client";

import { useEffect, useState, useCallback } from "react";
import type { Army, UnitEffectivenessOut } from "@/types";
import * as api from "@/lib/api";
import UnitSelector from "@/components/effectiveness/UnitSelector";
import DamageTable from "@/components/effectiveness/DamageTable";

export default function EffectivenessPage() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [result, setResult] = useState<UnitEffectivenessOut | null>(null);
  const [loadingArmies, setLoadingArmies] = useState(true);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setResult(null);
    setError(null);
    setLoadingCalc(true);
    try {
      const data = await api.getUnitEffectiveness(unitId);
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingCalc(false);
    }
  }

  if (loadingArmies) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    );
  }

  if (error && !result) {
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
        <h1 className="text-2xl font-bold text-white mb-1">Unit Effectiveness</h1>
        <p className="text-gray-400 text-sm">
          Expected damage and points efficiency per weapon against standard Warhammer 40K target profiles.
        </p>
      </div>

      <UnitSelector
        armies={armies}
        selectedUnitId={selectedUnitId}
        onChange={handleSelectUnit}
      />

      {loadingCalc && (
        <div className="text-gray-400 text-sm">Calculating…</div>
      )}

      {error && result === null && !loadingCalc && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {result && !loadingCalc && (
        result.results.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
            This unit has no weapons. Add weapons on the Army Management page to see calculations.
          </div>
        ) : (
          <DamageTable data={result} />
        )
      )}

      {!selectedUnitId && !loadingCalc && (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
          Select a unit above to calculate its damage output against all target profiles.
        </div>
      )}
    </div>
  );
}
