"use client";

import { useRef, useState } from "react";
import type { ArmyImport } from "@/types";

interface Props {
  onImport: (data: ArmyImport) => Promise<void>;
  onCancel: () => void;
}

export default function ImportPanel({ onImport, onCancel }: Props) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let parsed: ArmyImport;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("Invalid JSON — check the format and try again.");
      return;
    }

    if (!parsed.name || !parsed.faction) {
      setError('JSON must have "name" and "faction" fields.');
      return;
    }

    setSaving(true);
    try {
      await onImport(parsed);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Import Army JSON</span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs btn-secondary"
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
        rows={8}
        placeholder={'{\n  "name": "My Army",\n  "faction": "Space Marines",\n  "points_limit": 2000,\n  "units": []\n}'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input font-mono text-xs resize-y"
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          Cancel
        </button>
        <button type="submit" disabled={saving || !text.trim()} className="btn-primary text-sm">
          {saving ? "Importing…" : "Import"}
        </button>
      </div>
    </form>
  );
}
