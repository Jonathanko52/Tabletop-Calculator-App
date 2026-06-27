"use client";

import { useRef, useState } from "react";
import type { UnitTemplate, UnitTemplateCreate } from "@/types";

interface Props {
  templates: UnitTemplate[];
  onImport: (data: UnitTemplateCreate[]) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function LibraryPanel({ templates, onImport, onDelete }: Props) {
  const [showImport, setShowImport] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file);
  }

  async function handleImport(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    let parsed: UnitTemplateCreate[];
    try {
      parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Expected a JSON array of units.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
      return;
    }

    setSaving(true);
    try {
      await onImport(parsed);
      setText("");
      setShowImport(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 bg-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Unit Library</span>
        <button
          onClick={() => { setShowImport((v) => !v); setError(null); }}
          className="text-xs btn-secondary"
        >
          {showImport ? "Cancel" : "Import JSON"}
        </button>
      </div>

      {showImport && (
        <form onSubmit={handleImport} className="flex flex-col gap-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Upload file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFile}
            />
          </div>
          <textarea
            required
            rows={6}
            placeholder={'[\n  {\n    "name": "Intercessor Squad",\n    "points_cost": 85,\n    ...\n  }\n]'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input font-mono text-xs resize-y"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={saving || !text.trim()} className="btn-primary text-sm">
            {saving ? "Importing…" : "Import"}
          </button>
        </form>
      )}

      {templates.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-2">
          No templates yet. Import a JSON file to populate the library.
        </p>
      ) : (
        <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-sm py-1">
              <span className="text-gray-200 truncate">{t.name}</span>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-xs text-indigo-400">{t.points_cost}pts</span>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
