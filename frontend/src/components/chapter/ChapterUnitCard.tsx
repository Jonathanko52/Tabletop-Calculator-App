"use client";

import { useState } from "react";
import type { Unit } from "@/types";
import * as api from "@/lib/api";

interface Props {
  unit: Unit;
  allUnits: Unit[];
  onUpdate: (updated: Unit) => void;
}

export default function ChapterUnitCard({ unit, allUnits, onUpdate }: Props) {
  const [nickname, setNickname] = useState(unit.nickname ?? "");
  const [notes, setNotes] = useState(unit.notes ?? "");

  async function save(patch: {
    nickname?: string;
    notes?: string;
    attached_to_unit_id?: number | null;
  }) {
    const updated = await api.updateUnitChapter(unit.id, {
      nickname: patch.nickname ?? nickname,
      notes: patch.notes ?? notes,
      attached_to_unit_id:
        patch.attached_to_unit_id !== undefined
          ? patch.attached_to_unit_id
          : unit.attached_to_unit_id,
    });
    onUpdate(updated);
  }

  const otherUnits = allUnits.filter((u) => u.id !== unit.id);

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-white">{unit.name}</div>
          <div className="text-xs mt-0.5 flex gap-1.5 items-center">
            <span
              className={
                unit.status === "ready" ? "text-green-400" : "text-amber-400"
              }
            >
              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
            </span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">{unit.points_cost} pts</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">{unit.model_count} {unit.model_count === 1 ? "model" : "models"}</span>
          </div>
        </div>
      </div>

      {/* Nickname */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Nickname</label>
        <input
          className="input text-sm"
          placeholder="e.g. Squad Victus"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={() => save({ nickname })}
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Notes</label>
        <textarea
          className="input text-sm resize-none"
          rows={2}
          placeholder="Background, special rules, hobby notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save({ notes })}
        />
      </div>

      {/* Attached to unit */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Attached to unit</label>
        <select
          value={unit.attached_to_unit_id ?? ""}
          onChange={(e) => {
            const val = e.target.value === "" ? null : Number(e.target.value);
            save({ attached_to_unit_id: val });
          }}
          className="input text-sm"
        >
          <option value="">— none —</option>
          {otherUnits.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nickname ? `${u.name} (${u.nickname})` : u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attachments placeholder */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Attachments</span>
          <span className="flex-1 border-t border-gray-700" />
        </div>
        <span className="text-xs text-gray-600 italic">Coming soon</span>
      </div>

      {/* Enhancements placeholder */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Enhancements</span>
          <span className="flex-1 border-t border-gray-700" />
        </div>
        <span className="text-xs text-gray-600 italic">Coming soon</span>
      </div>
    </div>
  );
}
