"use client";

import { useState } from "react";
import type { Army, Unit, UnitCreate, ArmyCreate } from "@/types";
import UnitCard from "./UnitCard";
import UnitForm from "./UnitForm";

interface Props {
  army: Army;
  onAddUnit: (data: UnitCreate) => Promise<void>;
  onUpdateUnit: (unitId: number, data: UnitCreate) => Promise<void>;
  onDeleteUnit: (unitId: number) => Promise<void>;
  onUpdateArmy: (data: ArmyCreate) => Promise<void>;
  onDeleteArmy: () => Promise<void>;
}

export default function ArmyDetail({
  army,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onUpdateArmy,
  onDeleteArmy,
}: Props) {
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [addingUnit, setAddingUnit] = useState(false);
  const [editingArmy, setEditingArmy] = useState(false);
  const [armyForm, setArmyForm] = useState<ArmyCreate>({
    name: army.name,
    faction: army.faction,
    points_limit: army.points_limit,
  });

  const totalPoints = army.units.reduce((s, u) => s + u.points_cost, 0);
  const pctUsed = Math.min(100, (totalPoints / army.points_limit) * 100);
  const overLimit = totalPoints > army.points_limit;

  async function handleSaveUnit(data: UnitCreate) {
    if (editingUnit) {
      await onUpdateUnit(editingUnit.id, data);
      setEditingUnit(null);
    } else {
      await onAddUnit(data);
      setAddingUnit(false);
    }
  }

  async function handleSaveArmy(e: React.FormEvent) {
    e.preventDefault();
    await onUpdateArmy(armyForm);
    setEditingArmy(false);
  }

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0">
      {/* Army header */}
      {editingArmy ? (
        <form onSubmit={handleSaveArmy} className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              required
              placeholder="Army name"
              value={armyForm.name}
              onChange={(e) => setArmyForm({ ...armyForm, name: e.target.value })}
              className="input flex-1"
            />
            <input
              required
              placeholder="Faction"
              value={armyForm.faction}
              onChange={(e) => setArmyForm({ ...armyForm, faction: e.target.value })}
              className="input flex-1"
            />
            <input
              type="number"
              value={armyForm.points_limit}
              onChange={(e) => setArmyForm({ ...armyForm, points_limit: Number(e.target.value) })}
              className="input w-32"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setEditingArmy(false)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm">Save</button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{army.name}</h1>
              <p className="text-sm text-gray-400">{army.faction}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingArmy(true)} className="btn-secondary text-xs">Edit</button>
              <button
                onClick={onDeleteArmy}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-700"
              >
                Delete Army
              </button>
            </div>
          </div>
          {/* Points bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{totalPoints} / {army.points_limit} pts</span>
              <span className={overLimit ? "text-red-400 font-semibold" : "text-green-400"}>
                {overLimit ? `${totalPoints - army.points_limit} over limit` : `${army.points_limit - totalPoints} remaining`}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${overLimit ? "bg-red-500" : "bg-indigo-500"}`}
                style={{ width: `${pctUsed}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Unit list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-300">
            Units ({army.units.length})
          </span>
          {!addingUnit && !editingUnit && (
            <button onClick={() => setAddingUnit(true)} className="btn-primary text-xs">
              + Add Unit
            </button>
          )}
        </div>

        {addingUnit && (
          <UnitForm onSave={handleSaveUnit} onCancel={() => setAddingUnit(false)} />
        )}

        {army.units.map((unit) =>
          editingUnit?.id === unit.id ? (
            <UnitForm
              key={unit.id}
              initial={unit}
              onSave={handleSaveUnit}
              onCancel={() => setEditingUnit(null)}
            />
          ) : (
            <UnitCard
              key={unit.id}
              unit={unit}
              onEdit={setEditingUnit}
              onDelete={onDeleteUnit}
            />
          )
        )}

        {army.units.length === 0 && !addingUnit && (
          <p className="text-gray-500 text-sm text-center py-8">
            No units yet. Click &quot;+ Add Unit&quot; to get started.
          </p>
        )}
      </div>
    </div>
  );
}
