"use client";

import type { Unit } from "@/types";

interface Props {
  unit: Unit;
  onEdit: (unit: Unit) => void;
  onDelete: (id: number) => void;
}

const STAT_LABELS = [
  ["M", "movement"],
  ["T", "toughness"],
  ["SV", "save"],
  ["W", "wounds"],
  ["LD", "leadership"],
  ["OC", "oc"],
] as const;

export default function UnitCard({ unit, onEdit, onDelete }: Props) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(unit.id))}
      className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white">{unit.name}</h3>
          <span className="text-xs text-indigo-400 font-medium">{unit.points_cost} pts</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(unit)}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(unit.id)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Stat block */}
      <div className="grid grid-cols-6 text-center text-xs rounded-lg overflow-hidden border border-gray-700">
        {STAT_LABELS.map(([label]) => (
          <div key={label} className="bg-gray-750 text-gray-400 py-1 border-b border-gray-700 font-medium">
            {label}
          </div>
        ))}
        {STAT_LABELS.map(([label, field]) => (
          <div key={label} className="text-white py-1.5 font-mono">
            {unit[field]}+
          </div>
        ))}
      </div>

      {/* Weapons */}
      {unit.weapons.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="pb-1 pr-3 font-medium">Weapon</th>
                <th className="pb-1 px-2 font-medium text-center">Rng</th>
                <th className="pb-1 px-2 font-medium text-center">A</th>
                <th className="pb-1 px-2 font-medium text-center">BS/WS</th>
                <th className="pb-1 px-2 font-medium text-center">S</th>
                <th className="pb-1 px-2 font-medium text-center">AP</th>
                <th className="pb-1 px-2 font-medium text-center">D</th>
              </tr>
            </thead>
            <tbody>
              {unit.weapons.map((w) => (
                <tr key={w.id} className="border-b border-gray-700/50 last:border-0">
                  <td className="py-1 pr-3 text-gray-200">
                    <span className={`mr-1 ${w.weapon_type === "ranged" ? "text-blue-400" : "text-orange-400"}`}>
                      {w.weapon_type === "ranged" ? "⬡" : "⚔"}
                    </span>
                    {w.name}
                  </td>
                  <td className="py-1 px-2 text-center text-gray-300">{w.weapon_type === "ranged" ? `${w.range}"` : "—"}</td>
                  <td className="py-1 px-2 text-center text-gray-300">{w.attacks}</td>
                  <td className="py-1 px-2 text-center text-gray-300">{w.bs_ws}+</td>
                  <td className="py-1 px-2 text-center text-gray-300">{w.strength}</td>
                  <td className="py-1 px-2 text-center text-gray-300">-{Math.abs(w.ap)}</td>
                  <td className="py-1 px-2 text-center text-gray-300">{w.damage}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {unit.weapons.some((w) => w.special) && (
            <div className="mt-1 text-gray-400 italic text-xs">
              {unit.weapons.filter((w) => w.special).map((w) => (
                <span key={w.id}>{w.name}: {w.special} </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
