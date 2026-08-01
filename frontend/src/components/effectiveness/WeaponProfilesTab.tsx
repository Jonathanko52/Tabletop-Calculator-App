"use client";

import { useState, useEffect } from "react";
import type { UnitTemplate, UnitEffectivenessOut, CustomProfileOut } from "@/types";
import * as api from "@/lib/api";
import FactionUnitPicker from "@/components/effectiveness/FactionUnitPicker";
import DamageTable from "@/components/effectiveness/DamageTable";
import CustomProfileTable from "@/components/effectiveness/CustomProfileTable";

interface Props {
  templates: UnitTemplate[];
}

export default function WeaponProfilesTab({ templates }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [profileResult, setProfileResult] = useState<UnitEffectivenessOut | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const [customT, setCustomT] = useState(4);
  const [customSave, setCustomSave] = useState(3);
  const [customInvuln, setCustomInvuln] = useState(7);
  const [customFnp, setCustomFnp] = useState(0);
  const [customResult, setCustomResult] = useState<CustomProfileOut | null>(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  async function handleSelectTemplate(templateId: number) {
    setSelectedTemplateId(templateId);
    setProfileResult(null);
    setCalcError(null);
    setLoadingCalc(true);
    try {
      const data = await api.getTemplateEffectiveness(templateId);
      setProfileResult(data);
    } catch (e) {
      setCalcError(String(e));
    } finally {
      setLoadingCalc(false);
    }
  }

  useEffect(() => {
    if (!selectedTemplateId) { setCustomResult(null); return; }
    let cancelled = false;
    setLoadingCustom(true);
    api.getTemplateCustomProfile(selectedTemplateId, {
      toughness: customT,
      armor_save: customSave,
      invuln_save: customInvuln,
      fnp: customFnp,
    }).then((data) => { if (!cancelled) setCustomResult(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingCustom(false); });
    return () => { cancelled = true; };
  }, [selectedTemplateId, customT, customSave, customInvuln, customFnp]);

  return (
    <>
      <FactionUnitPicker
        label="Select Unit"
        templates={templates}
        selectedId={selectedTemplateId}
        onChange={handleSelectTemplate}
      />

      {loadingCalc && (
        <div className="text-gray-400 text-sm">Calculating…</div>
      )}

      {calcError && profileResult === null && !loadingCalc && (
        <p className="text-red-400 text-sm">{calcError}</p>
      )}

      {profileResult && !loadingCalc && (
        profileResult.results.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
            This unit has no weapons.
          </div>
        ) : (
          <DamageTable data={profileResult} />
        )
      )}

      {!selectedTemplateId && !loadingCalc && (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
          Select a unit above to calculate its damage output against all target profiles.
        </div>
      )}

      {selectedTemplateId && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Custom Target</h2>
            <div className="flex-1 border-t border-gray-700" />
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Toughness</label>
              <input
                type="number"
                min={1}
                max={12}
                value={customT}
                onChange={(e) => setCustomT(Math.min(12, Math.max(1, Number(e.target.value))))}
                className="input w-20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Armour Save</label>
              <select value={customSave} onChange={(e) => setCustomSave(Number(e.target.value))} className="input">
                <option value={7}>No Save</option>
                <option value={6}>6+</option>
                <option value={5}>5+</option>
                <option value={4}>4+</option>
                <option value={3}>3+</option>
                <option value={2}>2+</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Invuln Save</label>
              <select value={customInvuln} onChange={(e) => setCustomInvuln(Number(e.target.value))} className="input">
                <option value={7}>None</option>
                <option value={6}>6++</option>
                <option value={5}>5++</option>
                <option value={4}>4++</option>
                <option value={3}>3++</option>
                <option value={2}>2++</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Feel No Pain</label>
              <select value={customFnp} onChange={(e) => setCustomFnp(Number(e.target.value))} className="input">
                <option value={0}>None</option>
                <option value={4}>4+++</option>
                <option value={5}>5+++</option>
                <option value={6}>6+++</option>
              </select>
            </div>
          </div>
          {loadingCustom && <div className="text-gray-400 text-sm">Calculating…</div>}
          {customResult && !loadingCustom && <CustomProfileTable result={customResult} />}
        </div>
      )}
    </>
  );
}
