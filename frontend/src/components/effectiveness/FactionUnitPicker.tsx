"use client";

import { useState } from "react";
import type { UnitTemplate } from "@/types";

interface Props {
  label: string;
  templates: UnitTemplate[];
  selectedId: number | null;
  onChange: (id: number) => void;
}

export default function FactionUnitPicker({ label, templates, selectedId, onChange }: Props) {
  const factions = [...new Set(templates.map((t) => t.source))].sort();
  const [faction, setFaction] = useState<string>(factions[0] ?? "");

  const factionUnits = templates.filter((t) => t.source === faction);

  if (templates.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <p className="text-gray-500 text-sm">No unit templates found. Import a faction on the Army Management page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex flex-col gap-2">
        <select
          value={faction}
          onChange={(e) => setFaction(e.target.value)}
          className="input"
        >
          {factions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select
          value={selectedId ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="input flex-1"
          disabled={factionUnits.length === 0}
        >
          <option value="" disabled>— pick a unit —</option>
          {factionUnits.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.points_cost} pts
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
