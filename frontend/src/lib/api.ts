import type { Army, ArmyCreate, Unit, UnitCreate, UnitEffectivenessOut } from "@/types";

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

// --- Units ---

export const createUnit = (armyId: number, data: UnitCreate) =>
  request<Unit>(`/units/${armyId}`, { method: "POST", body: JSON.stringify(data) });

export const updateUnit = (unitId: number, data: UnitCreate) =>
  request<Unit>(`/units/${unitId}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteUnit = (unitId: number) =>
  request<void>(`/units/${unitId}`, { method: "DELETE" });

// --- Effectiveness ---

export const getUnitEffectiveness = (unitId: number) =>
  request<UnitEffectivenessOut>(`/effectiveness/${unitId}`);
