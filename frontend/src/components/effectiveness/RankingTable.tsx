import type { FactionRankOut } from "@/types";

export default function RankingTable({ result }: { result: FactionRankOut }) {
  const { profile, units } = result;

  if (units.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
        No units with weapons found in this army.
      </div>
    );
  }

  const maxDpp = units[0].damage_per_point;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        Ranked by damage / pt &mdash; profile: <span className="text-gray-300">{profile}</span>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Exp. Damage</th>
                <th className="px-4 py-3 text-right">Dmg / pt</th>
                <th className="px-4 py-3 w-32">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, i) => {
                const barWidth = maxDpp > 0 ? (unit.damage_per_point / maxDpp) * 100 : 0;
                const isTop = i === 0;
                return (
                  <tr
                    key={unit.unit_id}
                    className={`border-b border-gray-700/50 ${isTop ? "bg-green-900/20" : "hover:bg-gray-700/30"}`}
                  >
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${isTop ? "text-green-300" : "text-white"}`}>
                        {unit.unit_name}
                      </span>
                      {isTop && (
                        <span className="ml-2 text-xs bg-green-900/60 text-green-400 border border-green-700/50 rounded px-1.5 py-0.5">
                          best
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 font-mono">{unit.points_cost}</td>
                    <td className="px-4 py-3 text-right text-amber-300 font-mono">
                      {unit.total_expected_damage.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-300 font-mono font-semibold">
                      {unit.damage_per_point.toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
