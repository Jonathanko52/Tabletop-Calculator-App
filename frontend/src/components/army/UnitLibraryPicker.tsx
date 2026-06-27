"use client";

import { useState } from "react";
import type { UnitTemplate } from "@/types";

interface Props {
  templates: UnitTemplate[];
  onSelect: (template: UnitTemplate) => void;
  onCustom: () => void;
}

export default function UnitLibraryPicker({ templates, onSelect, onCustom }: Props) {
  const [selectedId, setSelectedId] = useState<number | "">("");

  function handleAdd() {
    const template = templates.find((t) => t.id === selectedId);
    if (template) {
      onSelect(template);
      setSelectedId("");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value === "" ? "" : Number(e.target.value))}
          className="input flex-1"
        >
          <option value="" disabled>— pick from library —</option>
          {templates.length === 0 && (
            <option disabled>No templates — import via Library</option>
          )}
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.points_cost} pts)
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={selectedId === ""}
          className="btn-primary text-sm shrink-0"
        >
          Add
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="flex-1 border-t border-gray-700" />
        <span>or</span>
        <span className="flex-1 border-t border-gray-700" />
      </div>
      <button type="button" onClick={onCustom} className="btn-secondary text-sm w-full">
        + Custom Unit
      </button>
    </div>
  );
}
