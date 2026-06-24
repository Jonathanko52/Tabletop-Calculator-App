"use client";

import { useEffect, useState, useCallback } from "react";
import type { Army, ArmyCreate, UnitCreate } from "@/types";
import * as api from "@/lib/api";
import ArmySidebar from "@/components/army/ArmySidebar";
import ArmyDetail from "@/components/army/ArmyDetail";

export default function ArmyPage() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedArmy = armies.find((a) => a.id === selectedId) ?? null;

  const loadArmies = useCallback(async () => {
    try {
      const data = await api.getArmies();
      setArmies(data);
      // Auto-select first army if nothing is selected
      setSelectedId((prev) => prev ?? (data[0]?.id ?? null));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArmies();
  }, [loadArmies]);

  async function handleCreateArmy(data: ArmyCreate) {
    const army = await api.createArmy(data);
    await loadArmies();
    setSelectedId(army.id);
  }

  async function handleDeleteArmy(id: number) {
    if (!confirm("Delete this army and all its units?")) return;
    await api.deleteArmy(id);
    setSelectedId(null);
    await loadArmies();
  }

  async function handleUpdateArmy(data: ArmyCreate) {
    if (!selectedId) return;
    await api.updateArmy(selectedId, data);
    await loadArmies();
  }

  async function handleAddUnit(data: UnitCreate) {
    if (!selectedId) return;
    await api.createUnit(selectedId, data);
    await loadArmies();
  }

  async function handleUpdateUnit(unitId: number, data: UnitCreate) {
    await api.updateUnit(unitId, data);
    await loadArmies();
  }

  async function handleDeleteUnit(unitId: number) {
    if (!confirm("Remove this unit?")) return;
    await api.deleteUnit(unitId);
    await loadArmies();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading armies…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-400 text-sm">Could not connect to backend: {error}</p>
        <p className="text-gray-500 text-xs">Make sure FastAPI is running on port 8000.</p>
        <button onClick={loadArmies} className="btn-secondary text-sm">Retry</button>
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
        onDelete={handleDeleteArmy}
      />

      {selectedArmy ? (
        <ArmyDetail
          army={selectedArmy}
          onAddUnit={handleAddUnit}
          onUpdateUnit={handleUpdateUnit}
          onDeleteUnit={handleDeleteUnit}
          onUpdateArmy={handleUpdateArmy}
          onDeleteArmy={() => handleDeleteArmy(selectedArmy.id)}
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
