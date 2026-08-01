import type { CustomProfileOut } from "@/types";

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

const SAVE_LABEL: Record<number, string> = { 2: "2+", 3: "3+", 4: "4+", 5: "5+", 6: "6+", 7: "—" };
const INVULN_LABEL: Record<number, string> = { 2: "2++", 3: "3++", 4: "4++", 5: "5++", 6: "6++", 7: "None" };
const FNP_LABEL: Record<number, string> = { 0: "None", 4: "4+++", 5: "5+++", 6: "6+++" };

export default function CustomProfileTable({ result }: { result: CustomProfileOut }) {
  const hasFnp = result.fnp > 0;

  const profileDesc = [
    `T${result.toughness}`,
    SAVE_LABEL[result.armor_save] ?? `${result.armor_save}+`,
    result.invuln_save < 7 ? (INVULN_LABEL[result.invuln_save] ?? `${result.invuln_save}++`) : null,
    result.fnp > 0 ? (FNP_LABEL[result.fnp] ?? `${result.fnp}+++`) : null,
  ].filter(Boolean).join(" · ");

  if (result.weapons.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
        This unit has no weapons.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        Target: <span className="text-gray-300">{profileDesc}</span>
      </div>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Weapon</th>
                <th className="px-4 py-3 text-right">To Hit</th>
                <th className="px-4 py-3 text-right">To Wound</th>
                <th className="px-4 py-3 text-right">Pen Armour</th>
                {hasFnp && <th className="px-4 py-3 text-right">Through FNP</th>}
                <th className="px-4 py-3 text-right">Exp. Damage</th>
                <th className="px-4 py-3 text-right">Dmg / pt</th>
              </tr>
            </thead>
            <tbody>
              {result.weapons.map((w) => (
                <tr key={w.weapon_name} className="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={w.weapon_type === "ranged" ? "text-blue-400" : "text-orange-400"}>
                        {w.weapon_type === "ranged" ? "⬡" : "⚔"}
                      </span>
                      <span className="text-white font-medium">{w.weapon_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-300 font-mono">{pct(w.p_hit)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-300 font-mono">{pct(w.p_wound)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-300 font-mono">{pct(w.p_fail_save)}</td>
                  {hasFnp && (
                    <td className="px-4 py-2.5 text-right text-gray-300 font-mono">{pct(w.p_damage_through)}</td>
                  )}
                  <td className="px-4 py-2.5 text-right text-amber-300 font-mono font-semibold">
                    {w.expected_damage.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-green-300 font-mono">
                    {w.damage_per_point.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
