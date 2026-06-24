"use client";

import type { Army } from "@/types";

interface Props {
  armies: Army[];
  selectedUnitId: number | null;
  onChange: (unitId: number) => void;
}

export default function UnitSelector({ armies, selectedUnitId, onChange }: Props) {
  const hasUnits = armies.some((a) => a.units.length > 0);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-300">Select Unit</label>
      {!hasUnits ? (
        <p className="text-gray-500 text-sm">
          No units found. Add units on the Army Management page first.
        </p>
      ) : (
        <select
          value={selectedUnitId ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="input max-w-xs"
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
      )}
    </div>
  );
}
