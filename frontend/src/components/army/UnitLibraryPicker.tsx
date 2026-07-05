"use client";

import { useState } from "react";
import type { UnitTemplate } from "@/types";

type SortKey = "alpha-asc" | "alpha-desc" | "pts-asc" | "pts-desc";

interface Props {
  templates: UnitTemplate[];
  onSelect: (template: UnitTemplate) => void;
  onCustom: () => void;
}

export default function UnitLibraryPicker({ templates, onSelect, onCustom }: Props) {
  const [selectedFaction, setSelectedFaction] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [minPts, setMinPts] = useState<string>("");
  const [maxPts, setMaxPts] = useState<string>("");
  const [filterBattleline, setFilterBattleline] = useState(false);
  const [filterCharacter, setFilterCharacter] = useState(false);
  const [sort, setSort] = useState<SortKey>("pts-asc");

  const factions = [...new Set(templates.map((t) => t.source).filter(Boolean))].sort();

  const filtered = templates
    .filter((t) => t.source === selectedFaction)
    .filter((t) => minPts === "" || t.points_cost >= Number(minPts))
    .filter((t) => maxPts === "" || t.points_cost <= Number(maxPts))
    .filter((t) => !filterBattleline || t.keywords.includes("Battleline"))
    .filter((t) => !filterCharacter  || t.keywords.includes("Character"))
    .sort((a, b) => {
      if (sort === "alpha-asc")  return a.name.localeCompare(b.name);
      if (sort === "alpha-desc") return b.name.localeCompare(a.name);
      if (sort === "pts-asc")    return a.points_cost - b.points_cost;
      return b.points_cost - a.points_cost;
    });

  function handleFactionChange(faction: string) {
    setSelectedFaction(faction);
    setSelectedId("");
  }

  function handleAdd() {
    const template = filtered.find((t) => t.id === selectedId);
    if (template) {
      onSelect(template);
      setSelectedId("");
    }
  }

  const chipClass = (active: boolean) =>
    `text-xs px-2 py-1 rounded border transition-colors cursor-pointer select-none ${
      active
        ? "bg-indigo-600 border-indigo-500 text-white"
        : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400"
    }`;

  return (
    <div className="flex flex-col gap-2">
      {/* Faction selector */}
      <select
        value={selectedFaction}
        onChange={(e) => handleFactionChange(e.target.value)}
        className="input"
      >
        <option value="" disabled>— pick faction —</option>
        {factions.length === 0 && <option disabled>No factions loaded</option>}
        {factions.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* Filters — only shown once a faction is selected */}
      {selectedFaction && (
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="number"
            placeholder="Min pts"
            value={minPts}
            onChange={(e) => { setMinPts(e.target.value); setSelectedId(""); }}
            className="input w-20 text-xs"
            min={0}
          />
          <span className="text-gray-500 text-xs">–</span>
          <input
            type="number"
            placeholder="Max pts"
            value={maxPts}
            onChange={(e) => { setMaxPts(e.target.value); setSelectedId(""); }}
            className="input w-20 text-xs"
            min={0}
          />

          <button
            type="button"
            onClick={() => { setFilterBattleline((v) => !v); setSelectedId(""); }}
            className={chipClass(filterBattleline)}
          >
            Battleline
          </button>
          <button
            type="button"
            onClick={() => { setFilterCharacter((v) => !v); setSelectedId(""); }}
            className={chipClass(filterCharacter)}
          >
            Character
          </button>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortKey); setSelectedId(""); }}
            className="input text-xs ml-auto"
          >
            <option value="pts-asc">Pts ↑</option>
            <option value="pts-desc">Pts ↓</option>
            <option value="alpha-asc">A → Z</option>
            <option value="alpha-desc">Z → A</option>
          </select>
        </div>
      )}

      {/* Unit selector + Add */}
      <div className="flex gap-2 items-center">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value === "" ? "" : Number(e.target.value))}
          disabled={!selectedFaction}
          className="input flex-1"
        >
          <option value="" disabled>
            {!selectedFaction
              ? "— pick faction first —"
              : filtered.length === 0
              ? "No units match filters"
              : "— pick unit —"}
          </option>
          {filtered.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.points_cost} pts)
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAdd}
          disabled={selectedId === ""}
          className="btn-primary text-sm shrink-0"
        >
          Add
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="flex-1 border-t border-gray-700" />
        <span>or</span>
        <span className="flex-1 border-t border-gray-700" />
      </div>

      <button type="button" onClick={onCustom} className="btn-secondary text-sm w-full">
        + Custom Unit
      </button>
    </div>
  );
}
