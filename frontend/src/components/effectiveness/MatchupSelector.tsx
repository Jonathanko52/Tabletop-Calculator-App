"use client";

import type { Army } from "@/types";

interface Props {
  armies: Army[];
  attackerId: number | null;
  defenderId: number | null;
  onAttackerChange: (id: number) => void;
  onDefenderChange: (id: number) => void;
  onCalculate: () => void;
  loading: boolean;
}

function UnitPicker({
  label,
  armies,
  selectedId,
  onChange,
}: {
  label: string;
  armies: Army[];
  selectedId: number | null;
  onChange: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input"
      >
        <option value="" disabled>
          — pick a unit —
        </option>
        {armies.map((army) =>
          army.units.length === 0 ? null : (
            <optgroup key={army.id} label={`${army.name} (${army.faction})`}>
              {army.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} — {unit.points_cost} pts
                </option>
              ))}
            </optgroup>
          )
        )}
      </select>
    </div>
  );
}

export default function MatchupSelector({
  armies,
  attackerId,
  defenderId,
  onAttackerChange,
  onDefenderChange,
  onCalculate,
  loading,
}: Props) {
  const hasUnits = armies.some((a) => a.units.length > 0);
  const canCalculate = attackerId !== null && defenderId !== null && !loading;

  if (!hasUnits) {
    return (
      <p className="text-gray-500 text-sm">
        No units found. Add units on the Army Management page first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UnitPicker
          label="Attacker"
          armies={armies}
          selectedId={attackerId}
          onChange={onAttackerChange}
        />
        <UnitPicker
          label="Defender"
          armies={armies}
          selectedId={defenderId}
          onChange={onDefenderChange}
        />
      </div>
      <button
        onClick={onCalculate}
        disabled={!canCalculate}
        className="btn-primary w-fit disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Calculating…" : "Calculate Match-up"}
      </button>
    </div>
  );
}
