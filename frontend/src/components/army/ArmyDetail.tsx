"use client";

import { useRef, useState } from "react";
import type { Army, ArmyImport, Unit, UnitCreate, UnitStatus, UnitTemplate, ArmyCreate } from "@/types";
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
  onImportArmy: (data: ArmyImport) => Promise<void>;
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
  onImportArmy,
}: Props) {
  const loadFileRef = useRef<HTMLInputElement>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [addMode, setAddMode] = useState<AddMode>("picker");
  const [templateSeed, setTemplateSeed] = useState<UnitTemplate | null>(null);
  const [editingArmy, setEditingArmy] = useState(false);
  const [armyForm, setArmyForm] = useState<ArmyCreate>({
    name: army.name,
    faction: army.faction,
    points_limit: army.points_limit,
  });

  // Picker state lifted here so it survives picker unmount/remount
  const [pickerFaction, setPickerFaction] = useState<string>("");
  const [pickerMinPts, setPickerMinPts] = useState<string>("");
  const [pickerMaxPts, setPickerMaxPts] = useState<string>("");
  const [pickerFilterBattleline, setPickerFilterBattleline] = useState(false);
  const [pickerFilterCharacter, setPickerFilterCharacter] = useState(false);
  const [pickerSort, setPickerSort] = useState<"alpha-asc" | "alpha-desc" | "pts-asc" | "pts-desc">("pts-asc");

  const readyPoints = army.units.filter((u) => u.status === "ready").reduce((s, u) => s + u.points_cost, 0);
  const otherPoints = army.units.filter((u) => u.status !== "ready").reduce((s, u) => s + u.points_cost, 0);
  const totalPoints = readyPoints + otherPoints;
  const readyPct = Math.min(100, (readyPoints / (army.points_limit || 1)) * 100);
  const overLimit = readyPoints > army.points_limit;

  const warnings: { text: string; level: "error" | "warn" | "info" }[] = [];
  if (army.units.length === 0)
    warnings.push({ text: "No units added yet.", level: "info" });
  if (totalPoints > army.points_limit)
    warnings.push({ text: `Total list is ${totalPoints - army.points_limit} pts over the limit.`, level: "error" });
  if (army.units.length > 0 && readyPoints === 0)
    warnings.push({ text: "No units marked Ready.", level: "warn" });

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

  function handleExportArmy() {
    const payload: ArmyImport = {
      name: army.name,
      faction: army.faction,
      points_limit: army.points_limit,
      units: army.units.map((u) => ({
        name: u.name,
        points_cost: u.points_cost,
        movement: u.movement,
        toughness: u.toughness,
        save: u.save,
        wounds: u.wounds,
        leadership: u.leadership,
        oc: u.oc,
        status: u.status,
        model_count: u.model_count,
        nickname: u.nickname,
        notes: u.notes,
        attached_to_unit_id: u.attached_to_unit_id,
        weapons: u.weapons.map((w) => ({
          weapon_type: w.weapon_type,
          name: w.name,
          range: w.range,
          attacks: w.attacks,
          bs_ws: w.bs_ws,
          strength: w.strength,
          ap: w.ap,
          damage: w.damage,
          special: w.special,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${army.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed: ArmyImport = JSON.parse(ev.target?.result as string);
        if (!parsed.name || !parsed.faction) {
          alert('Invalid army JSON — must have "name" and "faction".');
          return;
        }
        await onImportArmy(parsed);
      } catch {
        alert("Failed to parse army file — make sure it is valid JSON.");
      }
    };
    reader.readAsText(file);
  }

  // Convert a UnitTemplate to the shape UnitForm expects for its `initial` prop.
  // UnitForm only reads name/stats/weapons from initial — id and army_id are unused.
  const seedAsUnit: Unit | undefined = templateSeed
    ? {
        ...templateSeed,
        army_id: 0,
        status: "unpainted" as UnitStatus,
        model_count: 1,
        nickname: "",
        notes: "",
        attached_to_unit_id: null,
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
              <button onClick={handleExportArmy} className="btn-secondary text-xs">Save</button>
              <button onClick={() => loadFileRef.current?.click()} className="btn-secondary text-xs">Load</button>
              <input
                ref={loadFileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleLoadFile}
              />
              <button onClick={() => setEditingArmy(true)} className="btn-secondary text-xs">Edit</button>
              <button
                onClick={onDeleteArmy}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-700"
              >
                Delete Army
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Ready bar — hard limit */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-400 font-medium">Ready: {readyPoints} / {army.points_limit} pts</span>
                <span className={overLimit ? "text-red-400 font-semibold" : "text-gray-500"}>
                  {overLimit ? `${readyPoints - army.points_limit} over` : `${army.points_limit - readyPoints} remaining`}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${overLimit ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${readyPct}%` }}
                />
              </div>
            </div>
            {/* Other bar — soft, informational */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-400 font-medium">In progress: {otherPoints} pts</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-amber-500/60"
                  style={{ width: `${Math.min(100, (otherPoints / (army.points_limit || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Validation warnings */}
          {warnings.length > 0 && (
            <div className="flex flex-col gap-1">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
                    w.level === "error"
                      ? "bg-red-900/40 text-red-300"
                      : w.level === "warn"
                      ? "bg-amber-900/40 text-amber-300"
                      : "bg-gray-700/60 text-gray-400"
                  }`}
                >
                  <span>{w.level === "error" ? "✕" : w.level === "warn" ? "⚠" : "ℹ"}</span>
                  {w.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add unit section */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-gray-300">
          Units ({army.units.length})
        </span>
        {!editingUnit && (
          <UnitLibraryPicker
            templates={unitTemplates}
            onSelect={handleSelectTemplate}
            onCustom={handleCustom}
            faction={pickerFaction}
            onFactionChange={setPickerFaction}
            minPts={pickerMinPts}
            onMinPtsChange={setPickerMinPts}
            maxPts={pickerMaxPts}
            onMaxPtsChange={setPickerMaxPts}
            filterBattleline={pickerFilterBattleline}
            onFilterBattlelineChange={setPickerFilterBattleline}
            filterCharacter={pickerFilterCharacter}
            onFilterCharacterChange={setPickerFilterCharacter}
            sort={pickerSort}
            onSortChange={setPickerSort}
          />
        )}
      </div>

      {/* Modal: add unit form (template or blank) */}
      {showingAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={cancelAdd}
        >
          <div
            className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <UnitForm
              initial={seedAsUnit}
              onSave={handleSaveNewUnit}
              onCancel={cancelAdd}
            />
          </div>
        </div>
      )}

      {/* Modal: edit existing unit */}
      {editingUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingUnit(null)}
        >
          <div
            className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <UnitForm
              initial={editingUnit}
              onSave={handleSaveEditUnit}
              onCancel={() => setEditingUnit(null)}
            />
            <div className="flex justify-end px-1">
              <button
                onClick={async () => {
                  await onDeleteUnit(editingUnit.id);
                  setEditingUnit(null);
                }}
                className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded hover:bg-gray-800"
              >
                Delete Unit
              </button>
            </div>
          </div>
        </div>
      )}

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

              {colUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onEdit={(u) => { setAddMode("picker"); setEditingUnit(u); }}
                />
              ))}

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
