"use client";

import { useEffect, useState } from "react";
import type { Unit } from "@/types";
import ChapterUnitCard from "@/components/chapter/ChapterUnitCard";
import { useArmies } from "@/hooks/useArmies";

export default function ChapterPage() {
  const { armies, setArmies, loading, error, reload } = useArmies();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (armies.length > 0) {
      setSelectedId((prev) => prev ?? armies[0].id);
    }
  }, [armies]);

  const selectedArmy = armies.find((a) => a.id === selectedId) ?? null;
  const visibleUnits =
    selectedArmy?.units.filter(
      (u) => u.status === "painted" || u.status === "ready"
    ) ?? [];

  function handleUnitUpdate(updated: Unit) {
    setArmies((prev) =>
      prev.map((army) =>
        army.id !== updated.army_id
          ? army
          : {
              ...army,
              units: army.units.map((u) => (u.id === updated.id ? updated : u)),
            }
      )
    );
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
        <button onClick={reload} className="btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Chapter Manager</h1>
        <p className="text-gray-400 text-sm">
          Nicknames, notes, and attachments for your painted and ready units.
        </p>
      </div>

      {/* Army selector */}
      {armies.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
          Create an army in Army Management to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">Army</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="input max-w-xs"
          >
            {armies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.faction})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Unit list */}
      {selectedArmy && visibleUnits.length === 0 && (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
          No painted or ready units in this army yet. Mark units as Painted or Ready on the Army Management page.
        </div>
      )}

      {selectedArmy && visibleUnits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleUnits.map((unit) => (
            <ChapterUnitCard
              key={unit.id}
              unit={unit}
              allUnits={selectedArmy.units}
              onUpdate={handleUnitUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
