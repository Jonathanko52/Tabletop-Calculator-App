"use client";

import type { UnitEffectivenessOut, WeaponEffectiveness } from "@/types";

interface Props {
  data: UnitEffectivenessOut;
}

function heatmapColor(value: number, min: number, max: number): string {
  if (max === min) return "bg-gray-700";
  const t = (value - min) / (max - min); // 0 = cold, 1 = hot
  if (t < 0.2) return "bg-red-900/70";
  if (t < 0.4) return "bg-orange-900/70";
  if (t < 0.6) return "bg-yellow-900/70";
  if (t < 0.8) return "bg-green-900/70";
  return "bg-green-700/80";
}

export default function DamageTable({ data }: Props) {
  // Collect all unique weapon names and target profiles (in order)
  const weaponNames = Array.from(
    new Map(
      data.results.map((r) => [r.weapon_name, r.weapon_type])
    ).entries()
  );
  const profiles = Array.from(
    new Set(data.results.map((r) => r.target_profile))
  );

  // Build lookup: weapon_name → target_profile → result
  const lookup = new Map<string, Map<string, WeaponEffectiveness>>();
  for (const r of data.results) {
    if (!lookup.has(r.weapon_name)) lookup.set(r.weapon_name, new Map());
    lookup.get(r.weapon_name)!.set(r.target_profile, r);
  }

  // Compute global min/max damage_per_point for heatmap scale
  const allDpp = data.results.map((r) => r.damage_per_point);
  const minDpp = Math.min(...allDpp);
  const maxDpp = Math.max(...allDpp);

  return (
    <div className="flex flex-col gap-4">
      {/* Unit summary */}
      <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-400">Unit </span>
          <span className="font-semibold text-white">{data.unit_name}</span>
        </div>
        <div>
          <span className="text-gray-400">Points </span>
          <span className="font-semibold text-indigo-400">{data.points_cost}</span>
        </div>
        <div className="flex gap-3 text-xs text-gray-500 ml-auto">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-900/70" /> Low</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-yellow-900/70" /> Mid</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-700/80" /> High dmg/pt</span>
        </div>
      </div>

      {/* Damage table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="px-3 py-2 text-gray-400 font-medium w-48 sticky left-0 bg-gray-800">Weapon</th>
              {profiles.map((p) => (
                <th key={p} className="px-3 py-2 text-gray-400 font-medium text-center whitespace-nowrap">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weaponNames.map(([weaponName, weaponType]) => {
              const profileMap = lookup.get(weaponName)!;
              return (
                <tr key={weaponName} className="border-b border-gray-700/50 last:border-0 hover:bg-gray-800/40 transition-colors">
                  {/* Weapon name cell */}
                  <td className="px-3 py-3 sticky left-0 bg-gray-900 z-10">
                    <div className="flex items-center gap-1.5">
                      <span className={weaponType === "ranged" ? "text-blue-400" : "text-orange-400"}>
                        {weaponType === "ranged" ? "⬡" : "⚔"}
                      </span>
                      <span className="text-white font-medium">{weaponName}</span>
                    </div>
                    <div className="text-gray-500 mt-0.5 pl-4">dmg / dmg/pt</div>
                  </td>

                  {/* Data cells per profile */}
                  {profiles.map((profile) => {
                    const result = profileMap.get(profile);
                    if (!result) {
                      return <td key={profile} className="px-3 py-3 text-center text-gray-600">—</td>;
                    }
                    const cellColor = heatmapColor(result.damage_per_point, minDpp, maxDpp);
                    return (
                      <td
                        key={profile}
                        className={`px-3 py-3 text-center ${cellColor} transition-colors`}
                      >
                        <div className="font-semibold text-white">{result.expected_damage.toFixed(2)}</div>
                        <div className="text-gray-300 text-[10px] mt-0.5">{result.damage_per_point.toFixed(4)}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Values assume average dice rolls. Damage per point (dmg/pt) = expected damage ÷ unit points cost.
      </p>
    </div>
  );
}
