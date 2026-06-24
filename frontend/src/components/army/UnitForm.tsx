"use client";

import { useState } from "react";
import type { Unit, UnitCreate, WeaponCreate } from "@/types";
import WeaponForm from "./WeaponForm";

const BLANK_WEAPON: WeaponCreate = {
  weapon_type: "ranged",
  name: "",
  range: 24,
  attacks: "1",
  bs_ws: 4,
  strength: 4,
  ap: 0,
  damage: "1",
  special: "",
};

const BLANK_UNIT: UnitCreate = {
  name: "",
  points_cost: 0,
  movement: 6,
  toughness: 4,
  save: 4,
  wounds: 1,
  leadership: 7,
  oc: 1,
  weapons: [],
};

interface Props {
  initial?: Unit;
  onSave: (data: UnitCreate) => Promise<void>;
  onCancel: () => void;
}

export default function UnitForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<UnitCreate>(
    initial
      ? {
          name: initial.name,
          points_cost: initial.points_cost,
          movement: initial.movement,
          toughness: initial.toughness,
          save: initial.save,
          wounds: initial.wounds,
          leadership: initial.leadership,
          oc: initial.oc,
          weapons: initial.weapons.map((w) => ({
            weapon_type: w.weapon_type as "ranged" | "melee",
            name: w.name,
            range: w.range,
            attacks: w.attacks,
            bs_ws: w.bs_ws,
            strength: w.strength,
            ap: w.ap,
            damage: w.damage,
            special: w.special,
          })),
        }
      : BLANK_UNIT
  );
  const [saving, setSaving] = useState(false);

  function setField(field: keyof UnitCreate, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addWeapon() {
    setForm((f) => ({ ...f, weapons: [...f.weapons, { ...BLANK_WEAPON }] }));
  }

  function updateWeapon(index: number, w: WeaponCreate) {
    setForm((f) => {
      const weapons = [...f.weapons];
      weapons[index] = w;
      return { ...f, weapons };
    });
  }

  function removeWeapon(index: number) {
    setForm((f) => ({ ...f, weapons: f.weapons.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const statField = (label: string, field: keyof UnitCreate, min = 1) => (
    <label className="flex flex-col gap-0.5 text-xs">
      <span className="text-gray-400 font-medium">{label}</span>
      <input
        type="number"
        min={min}
        value={form[field] as number}
        onChange={(e) => setField(field, Number(e.target.value))}
        className="input"
      />
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex gap-3">
        <input
          required
          placeholder="Unit name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          className="input flex-1"
        />
        <label className="flex flex-col gap-0.5 text-xs w-28">
          <span className="text-gray-400 font-medium">Points</span>
          <input
            type="number"
            min={0}
            value={form.points_cost}
            onChange={(e) => setField("points_cost", Number(e.target.value))}
            className="input"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {statField("M", "movement")}
        {statField("T", "toughness")}
        {statField("SV", "save")}
        {statField("W", "wounds")}
        {statField("LD", "leadership")}
        {statField("OC", "oc", 0)}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Weapons</span>
          <button type="button" onClick={addWeapon} className="text-xs btn-secondary">
            + Add Weapon
          </button>
        </div>
        {form.weapons.map((w, i) => (
          <WeaponForm key={i} weapon={w} index={i} onChange={updateWeapon} onRemove={removeWeapon} />
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? "Saving…" : initial ? "Update Unit" : "Add Unit"}
        </button>
      </div>
    </form>
  );
}
