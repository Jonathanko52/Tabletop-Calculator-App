import type { TemplateMatchupOut } from "@/types";

export default function MatchupTable({ result }: { result: TemplateMatchupOut }) {
  const { attacker, defender, weapons, total_expected_damage, total_models_killed } = result;

  return (
    <div className="flex flex-col gap-5">
      {/* Matchup header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="bg-blue-900/40 border border-blue-700/40 rounded-xl px-4 py-3">
          <div className="text-xs text-blue-300 font-medium mb-0.5">Attacker</div>
          <div className="font-semibold text-white">{attacker.name}</div>
          <div className="text-xs text-gray-400">{attacker.points_cost} pts</div>
        </div>

        <div className="text-gray-500 font-bold text-lg text-center">vs</div>

        <div className="bg-red-900/40 border border-red-700/40 rounded-xl px-4 py-3">
          <div className="text-xs text-red-300 font-medium mb-0.5">Defender</div>
          <div className="font-semibold text-white">{defender.name}</div>
          <div className="text-xs text-gray-400">
            T{defender.toughness} &nbsp;{defender.save}+ save &nbsp;{defender.wounds}W
          </div>
        </div>
      </div>

      {/* Per-weapon table */}
      {weapons.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
          Attacker has no weapons. Add weapons on the Army Management page.
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-700 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">Weapon</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Exp. Damage</th>
                  <th className="px-4 py-3 text-right">Models Killed</th>
                  <th className="px-4 py-3 text-right">Dmg / pt</th>
                </tr>
              </thead>
              <tbody>
                {(["ranged", "melee"] as const).map((type) => {
                  const group = weapons.filter((w) => w.weapon_type === type);
                  if (group.length === 0) return null;
                  return (
                    <>
                      <tr key={`header-${type}`} className="bg-gray-700/40 border-b border-gray-700">
                        <td colSpan={5} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                          {type === "ranged" ? "Ranged" : "Melee"}
                        </td>
                      </tr>
                      {group.map((w, i) => (
                        <tr key={`${type}-${i}`} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="px-4 py-2.5 text-white font-medium">{w.weapon_name}</td>
                          <td className="px-4 py-2.5 text-gray-400 capitalize">{w.weapon_type}</td>
                          <td className="px-4 py-2.5 text-right text-amber-300 font-mono">
                            {w.expected_damage.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-sky-300 font-mono">
                            {w.models_killed.toFixed(3)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-green-300 font-mono">
                            {w.damage_per_point.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}
                <tr className="border-t-2 border-gray-600 font-semibold bg-gray-800">
                  <td className="px-4 py-3 text-gray-300" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-amber-300 font-mono">
                    {total_expected_damage.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sky-300 font-mono">
                    {total_models_killed.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-4">
          <div className="text-xs text-amber-400 mb-1">Total Expected Damage</div>
          <div className="text-3xl font-bold text-amber-300">{total_expected_damage.toFixed(2)}</div>
        </div>
        <div className="bg-sky-900/30 border border-sky-700/40 rounded-xl p-4">
          <div className="text-xs text-sky-400 mb-1">Expected Models Killed</div>
          <div className="text-3xl font-bold text-sky-300">{total_models_killed.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
