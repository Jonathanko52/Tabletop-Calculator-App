"use client";

import { useState, useEffect } from "react";
import type { Army, ArmyCreate, ArmyImport, UnitTemplate, UnitTemplateCreate } from "@/types";
import ImportPanel from "./ImportPanel";
import LibraryPanel from "./LibraryPanel";

interface Props {
  armies: Army[];
  selectedId: number | null;
  onSelect: (army: Army) => void;
  onCreate: (data: ArmyCreate) => Promise<void>;
  onImport: (data: ArmyImport) => Promise<void>;
  unitTemplates: UnitTemplate[];
  onImportTemplates: (data: UnitTemplateCreate[]) => Promise<void>;
  onDeleteTemplate: (id: number) => Promise<void>;
}

type Mode = "none" | "new" | "import" | "library";

const EMPTY_FORM: ArmyCreate = { name: "", faction: "", points_limit: 2000, notes: "" };
const STORAGE_KEY = "tabletop_army_order";

function loadStoredOrder(armies: Army[]): number[] {
  const existing = new Set(armies.map((a) => a.id));
  try {
    const stored: number[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const valid = stored.filter((id) => existing.has(id));
    const newIds = armies.map((a) => a.id).filter((id) => !valid.includes(id));
    return [...valid, ...newIds];
  } catch {
    return armies.map((a) => a.id);
  }
}

export default function ArmySidebar({
  armies, selectedId, onSelect, onCreate, onImport,
  unitTemplates, onImportTemplates, onDeleteTemplate,
}: Props) {
  const [mode, setMode] = useState<Mode>("none");
  const [form, setForm] = useState<ArmyCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [orderedIds, setOrderedIds] = useState<number[]>(() => loadStoredOrder(armies));
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Sync when armies are added or deleted
  useEffect(() => {
    setOrderedIds((prev) => {
      const existing = new Set(armies.map((a) => a.id));
      const newIds = armies.map((a) => a.id).filter((id) => !prev.includes(id));
      return [...prev.filter((id) => existing.has(id)), ...newIds];
    });
  }, [armies]);

  // Persist order to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderedIds));
    } catch {}
  }, [orderedIds]);

  const orderedArmies = orderedIds
    .map((id) => armies.find((a) => a.id === id))
    .filter(Boolean) as Army[];

  function handleDragStart(e: React.DragEvent, id: number) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragOverId) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: number) {
    e.preventDefault();
    if (draggingId === null || draggingId === targetId) return;
    setOrderedIds((prev) => {
      const next = prev.filter((id) => id !== draggingId);
      const idx = next.indexOf(targetId);
      next.splice(idx, 0, draggingId);
      return next;
    });
    setDraggingId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
  }

  function toggle(next: Mode) {
    setMode((cur) => (cur === next ? "none" : next));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    await onCreate(form);
    setForm(EMPTY_FORM);
    setMode("none");
    setSaving(false);
  }

  async function handleImport(data: ArmyImport) {
    await onImport(data);
    setMode("none");
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-300 text-sm uppercase tracking-widest">Armies</h2>
        <div className="flex gap-1 flex-wrap justify-end">
          <button
            onClick={() => toggle("new")}
            className="text-xs px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {mode === "new" ? "Cancel" : "+ New"}
          </button>
          <button
            onClick={() => toggle("import")}
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            {mode === "import" ? "Cancel" : "Import"}
          </button>
          <button
            onClick={() => toggle("library")}
            className={[
              "text-xs px-2 py-1 rounded transition-colors",
              mode === "library"
                ? "bg-amber-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200",
            ].join(" ")}
          >
            Library
          </button>
        </div>
      </div>

      {mode === "new" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-gray-800 rounded-lg p-3">
          <input
            required
            placeholder="Army name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
          <input
            required
            placeholder="Faction (e.g. Space Marines)"
            value={form.faction}
            onChange={(e) => setForm({ ...form, faction: e.target.value })}
            className="input"
          />
          <input
            type="number"
            placeholder="Points limit"
            value={form.points_limit}
            onChange={(e) => setForm({ ...form, points_limit: Number(e.target.value) })}
            className="input"
          />
          <button type="submit" disabled={saving} className="btn-primary text-sm py-1">
            {saving ? "Saving…" : "Create Army"}
          </button>
        </form>
      )}

      {mode === "import" && (
        <ImportPanel onImport={handleImport} onCancel={() => setMode("none")} />
      )}

      {mode === "library" && (
        <LibraryPanel
          templates={unitTemplates}
          onImport={onImportTemplates}
          onDelete={onDeleteTemplate}
        />
      )}

      <ul className="flex flex-col gap-1">
        {orderedArmies.length === 0 && (
          <li className="text-gray-500 text-sm text-center py-4">No armies yet.</li>
        )}
        {orderedArmies.map((army) => {
          const used = army.units.reduce((s, u) => s + u.points_cost, 0);
          const isSelected = army.id === selectedId;
          const isDragging = army.id === draggingId;
          const isOver = army.id === dragOverId;
          return (
            <li
              key={army.id}
              draggable
              onDragStart={(e) => handleDragStart(e, army.id)}
              onDragOver={(e) => handleDragOver(e, army.id)}
              onDrop={(e) => handleDrop(e, army.id)}
              onDragEnd={handleDragEnd}
              className={[
                "rounded-lg transition-all",
                isDragging ? "opacity-40" : "opacity-100",
                isOver ? "ring-2 ring-indigo-400" : "",
              ].join(" ")}
            >
              <button
                onClick={() => onSelect(army)}
                className={[
                  "w-full text-left rounded-lg px-3 py-2 transition-colors cursor-grab active:cursor-grabbing",
                  isSelected
                    ? "bg-indigo-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200",
                ].join(" ")}
              >
                <div className="font-medium text-sm truncate">{army.name}</div>
                <div className="text-xs opacity-70 flex justify-between mt-0.5">
                  <span>{army.faction}</span>
                  <span>{used}/{army.points_limit}pts</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
