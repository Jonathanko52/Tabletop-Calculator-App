"use client";

import { useState } from "react";
import type {
  UnitTemplate, FactionRankOut, FlexMatchupOut,
  CustomWeaponInput, CustomAttackerInput, CustomDefenderInput,
} from "@/types";
import * as api from "@/lib/api";
import FactionUnitPicker from "@/components/effectiveness/FactionUnitPicker";
import RankingTable from "@/components/effectiveness/RankingTable";
import FlexMatchupResultTable from "@/components/effectiveness/FlexMatchupResultTable";

type Mode = "ranking" | "headtohead";
type SideMode = "template" | "custom";

interface Props {
  templates: UnitTemplate[];
}

export default function RankingTab({ templates }: Props) {
  const [mode, setMode] = useState<Mode>("ranking");

  // --- Faction Ranking ---
  const [rankingFaction, setRankingFaction] = useState<string>("");
  const [rankingT, setRankingT] = useState(4);
  const [rankingSave, setRankingSave] = useState(3);
  const [rankingInvuln, setRankingInvuln] = useState(7);
  const [rankingFnp, setRankingFnp] = useState(0);
  const [rankingResult, setRankingResult] = useState<FactionRankOut | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  // --- Head-to-Head ---
  const [attackerMode, setAttackerMode] = useState<SideMode>("template");
  const [defenderMode, setDefenderMode] = useState<SideMode>("template");

  const [attackerTemplateId, setAttackerTemplateId] = useState<number | null>(null);
  const [defenderTemplateId, setDefenderTemplateId] = useState<number | null>(null);

  const [customAttackerName, setCustomAttackerName] = useState("Custom Unit");
  const [customAttackerPoints, setCustomAttackerPoints] = useState(100);
  const [customWeaponName, setCustomWeaponName] = useState("Custom Weapon");
  const [customWeaponType, setCustomWeaponType] = useState<"ranged" | "melee">("ranged");
  const [customWeaponAttacks, setCustomWeaponAttacks] = useState("1");
  const [customWeaponBsWs, setCustomWeaponBsWs] = useState(4);
  const [customWeaponStrength, setCustomWeaponStrength] = useState(4);
  const [customWeaponAp, setCustomWeaponAp] = useState(0);
  const [customWeaponDamage, setCustomWeaponDamage] = useState("1");

  const [customDefenderName, setCustomDefenderName] = useState("Custom Target");
  const [customDefenderT, setCustomDefenderT] = useState(4);
  const [customDefenderSave, setCustomDefenderSave] = useState(3);
  const [customDefenderInvuln, setCustomDefenderInvuln] = useState(7);
  const [customDefenderFnp, setCustomDefenderFnp] = useState(0);
  const [customDefenderWounds, setCustomDefenderWounds] = useState(1);
  const [customDefenderPoints, setCustomDefenderPoints] = useState(100);

  const [flexResult, setFlexResult] = useState<FlexMatchupOut | null>(null);
  const [loadingFlex, setLoadingFlex] = useState(false);
  const [flexError, setFlexError] = useState<string | null>(null);

  async function handleRankUnits() {
    if (!rankingFaction) return;
    setRankingResult(null);
    setRankingError(null);
    setLoadingRanking(true);
    try {
      const data = await api.getFactionCustomRanking(rankingFaction, {
        toughness: rankingT,
        armor_save: rankingSave,
        invuln_save: rankingInvuln,
        fnp: rankingFnp,
      });
      setRankingResult(data);
    } catch (e) {
      setRankingError(String(e));
    } finally {
      setLoadingRanking(false);
    }
  }

  async function handleCalculateFlex() {
    setFlexResult(null);
    setFlexError(null);
    setLoadingFlex(true);
    try {
      const weapon: CustomWeaponInput = {
        name: customWeaponName,
        weapon_type: customWeaponType,
        attacks: customWeaponAttacks,
        bs_ws: customWeaponBsWs,
        strength: customWeaponStrength,
        ap: customWeaponAp,
        damage: customWeaponDamage,
      };
      const custom_attacker: CustomAttackerInput = {
        name: customAttackerName,
        points_cost: customAttackerPoints,
        weapon,
      };
      const custom_defender: CustomDefenderInput = {
        name: customDefenderName,
        toughness: customDefenderT,
        armor_save: customDefenderSave,
        invuln_save: customDefenderInvuln,
        fnp: customDefenderFnp,
        wounds: customDefenderWounds,
        points_cost: customDefenderPoints,
      };
      const data = await api.getFlexMatchup({
        attacker_template_id: attackerMode === "template" ? attackerTemplateId : null,
        custom_attacker: attackerMode === "custom" ? custom_attacker : null,
        defender_template_id: defenderMode === "template" ? defenderTemplateId : null,
        custom_defender: defenderMode === "custom" ? custom_defender : null,
      });
      setFlexResult(data);
    } catch (e) {
      setFlexError(String(e));
    } finally {
      setLoadingFlex(false);
    }
  }

  const canCalculate =
    (attackerMode === "template" ? attackerTemplateId !== null : true) &&
    (defenderMode === "template" ? defenderTemplateId !== null : true);

  return (
    <>
      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1 w-fit">
        {(["ranking", "headtohead"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === m ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {m === "ranking" ? "Faction Ranking" : "Head-to-Head"}
          </button>
        ))}
      </div>

      {/* ── Faction Ranking ── */}
      {mode === "ranking" && (
        <>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">Faction</label>
              <select
                value={rankingFaction}
                onChange={(e) => { setRankingFaction(e.target.value); setRankingResult(null); }}
                className="input"
              >
                <option value="" disabled>— pick a faction —</option>
                {[...new Set(templates.map((t) => t.source))].sort().map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Toughness</label>
              <input type="number" min={1} max={12} value={rankingT}
                onChange={(e) => setRankingT(Math.min(12, Math.max(1, Number(e.target.value))))}
                className="input w-20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Armour Save</label>
              <select value={rankingSave} onChange={(e) => setRankingSave(Number(e.target.value))} className="input">
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
              <select value={rankingInvuln} onChange={(e) => setRankingInvuln(Number(e.target.value))} className="input">
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
              <select value={rankingFnp} onChange={(e) => setRankingFnp(Number(e.target.value))} className="input">
                <option value={0}>None</option>
                <option value={4}>4+++</option>
                <option value={5}>5+++</option>
                <option value={6}>6+++</option>
              </select>
            </div>
            <button onClick={handleRankUnits} disabled={!rankingFaction || loadingRanking}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingRanking ? "Ranking…" : "Rank Units"}
            </button>
          </div>
          {rankingError && <p className="text-red-400 text-sm">{rankingError}</p>}
          {rankingResult && !loadingRanking && <RankingTable result={rankingResult} />}
          {!rankingResult && !loadingRanking && !rankingError && (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
              Pick a faction and target profile above, then click Rank Units.
            </div>
          )}
        </>
      )}

      {/* ── Head-to-Head ── */}
      {mode === "headtohead" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Attacker panel */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Attacker</span>
                <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                  <input type="radio" name="attackerMode" value="template"
                    checked={attackerMode === "template"}
                    onChange={() => setAttackerMode("template")} />
                  Unit Template
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                  <input type="radio" name="attackerMode" value="custom"
                    checked={attackerMode === "custom"}
                    onChange={() => setAttackerMode("custom")} />
                  Custom Stats
                </label>
              </div>

              {/* Template picker */}
              <div className={attackerMode !== "template" ? "opacity-40 pointer-events-none" : ""}>
                <FactionUnitPicker label="Select Attacker" templates={templates}
                  selectedId={attackerTemplateId} onChange={setAttackerTemplateId} />
              </div>

              {/* Custom attacker fields */}
              <div className={`flex flex-col gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700 ${attackerMode !== "custom" ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-medium text-gray-400">Unit Name</label>
                    <input type="text" value={customAttackerName}
                      onChange={(e) => setCustomAttackerName(e.target.value)} className="input" />
                  </div>
                  <div className="flex flex-col gap-1 w-24">
                    <label className="text-xs font-medium text-gray-400">Points</label>
                    <input type="number" min={1} value={customAttackerPoints}
                      onChange={(e) => setCustomAttackerPoints(Math.max(1, Number(e.target.value)))} className="input" />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <div className="text-xs font-medium text-gray-400 mb-2">Weapon</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs text-gray-500">Name</label>
                        <input type="text" value={customWeaponName}
                          onChange={(e) => setCustomWeaponName(e.target.value)} className="input" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Type</label>
                        <select value={customWeaponType}
                          onChange={(e) => setCustomWeaponType(e.target.value as "ranged" | "melee")}
                          className="input">
                          <option value="ranged">Ranged</option>
                          <option value="melee">Melee</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Attacks</label>
                        <input type="text" value={customWeaponAttacks}
                          onChange={(e) => setCustomWeaponAttacks(e.target.value)}
                          className="input w-16" placeholder="3" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">BS/WS</label>
                        <select value={customWeaponBsWs}
                          onChange={(e) => setCustomWeaponBsWs(Number(e.target.value))} className="input">
                          <option value={2}>2+</option>
                          <option value={3}>3+</option>
                          <option value={4}>4+</option>
                          <option value={5}>5+</option>
                          <option value={6}>6+</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Strength</label>
                        <input type="number" min={1} max={24} value={customWeaponStrength}
                          onChange={(e) => setCustomWeaponStrength(Number(e.target.value))}
                          className="input w-16" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">AP</label>
                        <select value={customWeaponAp}
                          onChange={(e) => setCustomWeaponAp(Number(e.target.value))} className="input">
                          <option value={0}>AP 0</option>
                          <option value={-1}>AP -1</option>
                          <option value={-2}>AP -2</option>
                          <option value={-3}>AP -3</option>
                          <option value={-4}>AP -4</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Damage</label>
                        <input type="text" value={customWeaponDamage}
                          onChange={(e) => setCustomWeaponDamage(e.target.value)}
                          className="input w-16" placeholder="1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Defender panel */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-red-300 uppercase tracking-wide">Defender</span>
                <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                  <input type="radio" name="defenderMode" value="template"
                    checked={defenderMode === "template"}
                    onChange={() => setDefenderMode("template")} />
                  Unit Template
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                  <input type="radio" name="defenderMode" value="custom"
                    checked={defenderMode === "custom"}
                    onChange={() => setDefenderMode("custom")} />
                  Custom Stats
                </label>
              </div>

              {/* Template picker */}
              <div className={defenderMode !== "template" ? "opacity-40 pointer-events-none" : ""}>
                <FactionUnitPicker label="Select Defender" templates={templates}
                  selectedId={defenderTemplateId} onChange={setDefenderTemplateId} />
              </div>

              {/* Custom defender fields */}
              <div className={`flex flex-col gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700 ${defenderMode !== "custom" ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-medium text-gray-400">Unit Name</label>
                    <input type="text" value={customDefenderName}
                      onChange={(e) => setCustomDefenderName(e.target.value)} className="input" />
                  </div>
                  <div className="flex flex-col gap-1 w-24">
                    <label className="text-xs font-medium text-gray-400">Points</label>
                    <input type="number" min={1} value={customDefenderPoints}
                      onChange={(e) => setCustomDefenderPoints(Math.max(1, Number(e.target.value)))} className="input" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Toughness</label>
                    <input type="number" min={1} max={12} value={customDefenderT}
                      onChange={(e) => setCustomDefenderT(Math.min(12, Math.max(1, Number(e.target.value))))}
                      className="input w-16" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Armour Save</label>
                    <select value={customDefenderSave}
                      onChange={(e) => setCustomDefenderSave(Number(e.target.value))} className="input">
                      <option value={7}>No Save</option>
                      <option value={6}>6+</option>
                      <option value={5}>5+</option>
                      <option value={4}>4+</option>
                      <option value={3}>3+</option>
                      <option value={2}>2+</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Invuln</label>
                    <select value={customDefenderInvuln}
                      onChange={(e) => setCustomDefenderInvuln(Number(e.target.value))} className="input">
                      <option value={7}>None</option>
                      <option value={6}>6++</option>
                      <option value={5}>5++</option>
                      <option value={4}>4++</option>
                      <option value={3}>3++</option>
                      <option value={2}>2++</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">FNP</label>
                    <select value={customDefenderFnp}
                      onChange={(e) => setCustomDefenderFnp(Number(e.target.value))} className="input">
                      <option value={0}>None</option>
                      <option value={4}>4+++</option>
                      <option value={5}>5+++</option>
                      <option value={6}>6+++</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Wounds</label>
                    <input type="number" min={1} max={30} value={customDefenderWounds}
                      onChange={(e) => setCustomDefenderWounds(Math.max(1, Number(e.target.value)))}
                      className="input w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleCalculateFlex} disabled={!canCalculate || loadingFlex}
            className="btn-primary w-fit disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingFlex ? "Calculating…" : "Calculate Match-up"}
          </button>

          {flexError && <p className="text-red-400 text-sm">{flexError}</p>}
          {flexResult && !loadingFlex && <FlexMatchupResultTable result={flexResult} />}
          {!flexResult && !loadingFlex && !flexError && (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 text-sm border border-gray-700 border-dashed">
              Select or define an attacker and defender above, then click Calculate Match-up.
            </div>
          )}
        </>
      )}
    </>
  );
}
