"use client";

import { useState } from "react";
import type { Army, Unit, UnitCreate, UnitStatus, UnitTemplate, ArmyCreate } from "@/types";
import UnitCard from "./UnitCard";
import UnitForm from "./UnitForm";
import UnitLibraryPicker from "./UnitLibraryPicker";

interface Props {
  army: Army;
  unitTemplates: UnitTemplate[];
  onAddUnit: (data: UnitCreate) => Promise<void>;
  onUpdateUnit: (unitId: number, data: UnitCreate) => Promise<void>;
  onUpdateUnitStatus: (unitId: number, status: UnitStatus) => Promise<void>;
  onDeleteUnit: (unitId: number) => Promise<void>;
  onUpdateArmy: (data: ArmyCreate) => Promise<void>;
  onDeleteArmy: () => Promise<void>;
}

const COLUMNS: { status: UnitStatus; label: string; accent: string }[] = [
  { status: "unpainted", label: "Unpainted", accent: "border-gray-600" },
  { status: "painted",   label: "Painted",   accent: "border-amber-500" },
  { status: "ready",     label: "Ready",     accent: "border-green-500" },
];

type AddMode = "none" | "picker" | "form-blank" | "form-template";

export default function ArmyDetail({
  army,
  unitTemplates,
  onAddUnit,
  onUpdateUnit,
  onUpdateUnitStatus,
  onDeleteUnit,
  onUpdateArmy,
  onDeleteArmy,
}: Props) {
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [addMode, setAddMode] = useState<AddMode>("picker");
  const [templateSeed, setTemplateSeed] = useState<UnitTemplate | null>(null);
  const [editingArmy, setEditingArmy] = useState(false);
  const [armyForm, setArmyForm] = useState<ArmyCreate>({
    name: army.name,
    faction: army.faction,
    points_limit: army.points_limit,
  });

  const totalPoints = army.units.reduce((s, u) => s + u.points_cost, 0);
  const pctUsed = Math.min(100, (totalPoints / army.points_limit) * 100);
  const overLimit = totalPoints > army.points_limit;

  function handleSelectTemplate(template: UnitTemplate) {
    setTemplateSeed(template);
    setAddMode("form-template");
  }

  function handleCustom() {
    setTemplateSeed(null);
    setAddMode("form-blank");
  }

  function cancelAdd() {
    setTemplateSeed(null);
    setAddMode("picker");
  }

  async function handleSaveNewUnit(data: UnitCreate) {
    await onAddUnit(data);
    setTemplateSeed(null);
    setAddMode("picker");
  }

  async function handleSaveEditUnit(data: UnitCreate) {
    if (!editingUnit) return;
    await onUpdateUnit(editingUnit.id, data);
    setEditingUnit(null);
  }

  function handleDrop(e: React.DragEvent, newStatus: UnitStatus) {
    e.preventDefault();
    const unitId = Number(e.dataTransfer.getData("text/plain"));
    if (!unitId) return;
    onUpdateUnitStatus(unitId, newStatus);
  }

  async function handleSaveArmy(e: React.SyntheticEvent) {
    e.preventDefault();
    await onUpdateArmy(armyForm);
    setEditingArmy(false);
  }

  // Convert a UnitTemplate to the shape UnitForm expects for its `initial` prop.
  // UnitForm only reads name/stats/weapons from initial — id and army_id are unused.
  const seedAsUnit: Unit | undefined = templateSeed
    ? {
        ...templateSeed,
        army_id: 0,
        status: "unpainted" as UnitStatus,
        weapons: templateSeed.weapons.map((w) => ({ ...w, unit_id: 0 })),
      }
    : undefined;

  const showingAddForm = addMode === "form-blank" || addMode === "form-template";

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

      {/* Add unit section */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-gray-300">
          Units ({army.units.length})
        </span>
        {!editingUnit && (
          showingAddForm ? (
            <UnitForm
              initial={seedAsUnit}
              onSave={handleSaveNewUnit}
              onCancel={cancelAdd}
            />
          ) : (
            <UnitLibraryPicker
              templates={unitTemplates}
              onSelect={handleSelectTemplate}
              onCustom={handleCustom}
            />
          )
        )}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(({ status, label, accent }) => {
          const colUnits = army.units.filter((u) => u.status === status);
          const colPoints = colUnits.reduce((s, u) => s + u.points_cost, 0);
          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex flex-col gap-3 rounded-xl border-2 ${accent} bg-gray-900/50 p-3 min-h-48`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-200">{label}</span>
                <span className="text-xs text-gray-400">{colPoints} pts</span>
              </div>

              {colUnits.map((unit) =>
                editingUnit?.id === unit.id ? (
                  <UnitForm
                    key={unit.id}
                    initial={unit}
                    onSave={handleSaveEditUnit}
                    onCancel={() => setEditingUnit(null)}
                  />
                ) : (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    onEdit={(u) => { setAddMode("picker"); setEditingUnit(u); }}
                    onDelete={onDeleteUnit}
                  />
                )
              )}

              {colUnits.length === 0 && (
                <p className="text-gray-600 text-xs text-center py-6">Drop units here</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
