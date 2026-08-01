"use client";

import { useState } from "react";
import type { UnitTemplate, TemplateMatchupOut } from "@/types";
import * as api from "@/lib/api";
import FactionUnitPicker from "@/components/effectiveness/FactionUnitPicker";
import MatchupTable from "@/components/effectiveness/MatchupTable";

interface Props {
  templates: UnitTemplate[];
}

export default function MatchupTab({ templates }: Props) {
  const [attackerTemplateId, setAttackerTemplateId] = useState<number | null>(null);
  const [defenderTemplateId, setDefenderTemplateId] = useState<number | null>(null);
  const [matchupResult, setMatchupResult] = useState<TemplateMatchupOut | null>(null);
  const [loadingMatchup, setLoadingMatchup] = useState(false);
  const [matchupError, setMatchupError] = useState<string | null>(null);

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

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FactionUnitPicker
            label="Attacker"
            templates={templates}
            selectedId={attackerTemplateId}
            onChange={setAttackerTemplateId}
          />
          <FactionUnitPicker
            label="Defender"
            templates={templates}
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
  );
}
