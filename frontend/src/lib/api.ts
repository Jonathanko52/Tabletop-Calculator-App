import type { Army, ArmyCreate, ArmyImport, Unit, UnitCreate, UnitStatus, UnitTemplate, UnitTemplateCreate, UnitEffectivenessOut, MatchupOut, EfficiencyRankOut, TemplateMatchupOut, FactionRankOut } from "@/types";

const BASE = "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Armies ---

export const getArmies = () => request<Army[]>("/armies/");

export const getArmy = (id: number) => request<Army>(`/armies/${id}`);

export const createArmy = (data: ArmyCreate) =>
  request<Army>("/armies/", { method: "POST", body: JSON.stringify(data) });

export const updateArmy = (id: number, data: ArmyCreate) =>
  request<Army>(`/armies/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteArmy = (id: number) =>
  request<void>(`/armies/${id}`, { method: "DELETE" });

export const importArmy = (data: ArmyImport) =>
  request<Army>("/armies/import", { method: "POST", body: JSON.stringify(data) });

// --- Units ---

export const createUnit = (armyId: number, data: UnitCreate) =>
  request<Unit>(`/units/${armyId}`, { method: "POST", body: JSON.stringify(data) });

export const updateUnit = (unitId: number, data: UnitCreate) =>
  request<Unit>(`/units/${unitId}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteUnit = (unitId: number) =>
  request<void>(`/units/${unitId}`, { method: "DELETE" });

export const updateUnitStatus = (unitId: number, status: UnitStatus) =>
  request<Unit>(`/units/${unitId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

export const updateUnitChapter = (
  unitId: number,
  data: { nickname: string; notes: string; attached_to_unit_id: number | null }
) => request<Unit>(`/units/${unitId}/chapter`, { method: "PATCH", body: JSON.stringify(data) });

// --- Unit Templates ---

export const getUnitTemplates = () =>
  request<UnitTemplate[]>("/unit-templates/");

export const createUnitTemplate = (data: UnitTemplateCreate) =>
  request<UnitTemplate>("/unit-templates/", { method: "POST", body: JSON.stringify(data) });

export const deleteUnitTemplate = (id: number) =>
  request<void>(`/unit-templates/${id}`, { method: "DELETE" });

export const importUnitTemplates = (data: UnitTemplateCreate[]) =>
  request<UnitTemplate[]>("/unit-templates/import", { method: "POST", body: JSON.stringify(data) });

// --- Effectiveness ---

export const getUnitEffectiveness = (unitId: number) =>
  request<UnitEffectivenessOut>(`/effectiveness/${unitId}`);

export const getArmyRanking = (armyId: number, profile: string) =>
  request<EfficiencyRankOut>(
    `/effectiveness/army/${armyId}/ranking?profile=${encodeURIComponent(profile)}`
  );

export const getTemplateEffectiveness = (templateId: number) =>
  request<UnitEffectivenessOut>(`/effectiveness/template/${templateId}`);

export const getTemplateMatchup = (attackerTemplateId: number, defenderTemplateId: number) =>
  request<TemplateMatchupOut>("/effectiveness/matchup-templates", {
    method: "POST",
    body: JSON.stringify({ attacker_template_id: attackerTemplateId, defender_template_id: defenderTemplateId }),
  });

export const getFactionRanking = (faction: string, profile: string) =>
  request<FactionRankOut>(
    `/effectiveness/faction/${encodeURIComponent(faction)}/ranking?profile=${encodeURIComponent(profile)}`
  );

export const getMatchup = (attackerId: number, defenderId: number) =>
  request<MatchupOut>("/effectiveness/matchup", {
    method: "POST",
    body: JSON.stringify({ attacker_id: attackerId, defender_id: defenderId }),
  });
