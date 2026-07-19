"use client";

import { useEffect, useState, useCallback } from "react";
import type { ArmyCreate, ArmyImport, UnitCreate, UnitStatus, UnitTemplate, UnitTemplateCreate } from "@/types";
import * as api from "@/lib/api";
import { useArmies } from "@/hooks/useArmies";
import ArmySidebar from "@/components/army/ArmySidebar";
import ArmyDetail from "@/components/army/ArmyDetail";

export default function ArmyPage() {
  const { armies, loading, error, reload } = useArmies();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [unitTemplates, setUnitTemplates] = useState<UnitTemplate[]>([]);

  const selectedArmy = armies.find((a) => a.id === selectedId) ?? null;

  useEffect(() => {
    if (armies.length > 0) {
      setSelectedId((prev) => prev ?? armies[0].id);
    }
  }, [armies]);

  const loadTemplates = useCallback(async () => {
    const data = await api.getUnitTemplates();
    setUnitTemplates(data);
  }, []);

  useEffect(() => {
    loadTemplates().catch(() => {});
  }, [loadTemplates]);

  async function handleCreateArmy(data: ArmyCreate) {
    const army = await api.createArmy(data);
    await reload();
    setSelectedId(army.id);
  }

  async function handleImportArmy(data: ArmyImport) {
    const army = await api.importArmy(data);
    await reload();
    setSelectedId(army.id);
  }

  async function handleDeleteArmy(id: number) {
    if (!confirm("Delete this army and all its units?")) return;
    await api.deleteArmy(id);
    setSelectedId(null);
    await reload();
  }

  async function handleUpdateArmy(data: ArmyCreate) {
    if (!selectedId) return;
    await api.updateArmy(selectedId, data);
    await reload();
  }

  async function handleAddUnit(data: UnitCreate) {
    if (!selectedId) return;
    await api.createUnit(selectedId, data);
    await reload();
  }

  async function handleUpdateUnit(unitId: number, data: UnitCreate) {
    await api.updateUnit(unitId, data);
    await reload();
  }

  async function handleUpdateUnitStatus(unitId: number, status: UnitStatus) {
    await api.updateUnitStatus(unitId, status);
    await reload();
  }

  async function handleDeleteUnit(unitId: number) {
    if (!confirm("Remove this unit?")) return;
    await api.deleteUnit(unitId);
    await reload();
  }

  async function handleImportTemplates(data: UnitTemplateCreate[]) {
    await api.importUnitTemplates(data);
    await loadTemplates();
  }

  async function handleDeleteTemplate(id: number) {
    await api.deleteUnitTemplate(id);
    await loadTemplates();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-400 text-sm">Could not connect to backend: {error}</p>
        <p className="text-gray-500 text-xs">Make sure FastAPI is running on port 8000.</p>
        <button onClick={() => { reload(); loadTemplates(); }} className="btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      <ArmySidebar
        armies={armies}
        selectedId={selectedId}
        onSelect={(a) => setSelectedId(a.id)}
        onCreate={handleCreateArmy}
        onImport={handleImportArmy}
        unitTemplates={unitTemplates}
        onImportTemplates={handleImportTemplates}
        onDeleteTemplate={handleDeleteTemplate}
      />

      {selectedArmy ? (
        <ArmyDetail
          army={selectedArmy}
          unitTemplates={unitTemplates}
          onAddUnit={handleAddUnit}
          onUpdateUnit={handleUpdateUnit}
          onUpdateUnitStatus={handleUpdateUnitStatus}
          onDeleteUnit={handleDeleteUnit}
          onUpdateArmy={handleUpdateArmy}
          onDeleteArmy={() => handleDeleteArmy(selectedArmy.id)}
          onImportArmy={handleImportArmy}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center h-64 text-gray-500 text-sm">
          {armies.length === 0
            ? "Create your first army using the sidebar."
            : "Select an army to view it."}
        </div>
      )}
    </div>
  );
}
