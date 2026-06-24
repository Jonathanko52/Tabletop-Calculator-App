"use client";

import type { WeaponCreate } from "@/types";

interface Props {
  weapon: WeaponCreate;
  index: number;
  onChange: (index: number, w: WeaponCreate) => void;
  onRemove: (index: number) => void;
}

export default function WeaponForm({ weapon, index, onChange, onRemove }: Props) {
  function set(field: keyof WeaponCreate, value: string | number) {
    onChange(index, { ...weapon, [field]: value });
  }

  return (
    <div className="bg-gray-900 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <select
          value={weapon.weapon_type}
          onChange={(e) => set("weapon_type", e.target.value)}
          className="input w-28 text-sm"
        >
          <option value="ranged">Ranged</option>
          <option value="melee">Melee</option>
        </select>
        <input
          required
          placeholder="Weapon name"
          value={weapon.name}
          onChange={(e) => set("name", e.target.value)}
          className="input flex-1 text-sm"
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {weapon.weapon_type === "ranged" && (
          <label className="flex flex-col gap-0.5">
            Range
            <input
              type="number"
              min={0}
              value={weapon.range}
              onChange={(e) => set("range", Number(e.target.value))}
              className="input"
            />
          </label>
        )}
        <label className="flex flex-col gap-0.5">
          Attacks
          <input
            placeholder="e.g. 3 or D6"
            value={weapon.attacks}
            onChange={(e) => set("attacks", e.target.value)}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          {weapon.weapon_type === "ranged" ? "BS" : "WS"}
          <input
            type="number"
            min={2}
            max={6}
            value={weapon.bs_ws}
            onChange={(e) => set("bs_ws", Number(e.target.value))}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          Strength
          <input
            type="number"
            min={1}
            value={weapon.strength}
            onChange={(e) => set("strength", Number(e.target.value))}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          AP
          <input
            type="number"
            max={0}
            value={weapon.ap}
            onChange={(e) => set("ap", Number(e.target.value))}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          Damage
          <input
            placeholder="e.g. 2 or D3"
            value={weapon.damage}
            onChange={(e) => set("damage", e.target.value)}
            className="input"
          />
        </label>
      </div>
      <input
        placeholder="Special rules (optional)"
        value={weapon.special}
        onChange={(e) => set("special", e.target.value)}
        className="input text-xs"
      />
    </div>
  );
}
