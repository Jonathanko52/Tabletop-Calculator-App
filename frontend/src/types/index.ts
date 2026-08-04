export interface Weapon {
  id: number;
  unit_id: number;
  weapon_type: "ranged" | "melee";
  name: string;
  range: number;
  attacks: string;
  bs_ws: number;
  strength: number;
  ap: number;
  damage: string;
  special: string;
}

export interface WeaponCreate {
  weapon_type: "ranged" | "melee";
  name: string;
  range: number;
  attacks: string;
  bs_ws: number;
  strength: number;
  ap: number;
  damage: string;
  special: string;
}

export type UnitStatus = "unpainted" | "painted" | "ready";

export interface Unit {
  id: number;
  army_id: number;
  name: string;
  points_cost: number;
  movement: number;
  toughness: number;
  save: number;
  wounds: number;
  leadership: number;
  oc: number;
  status: UnitStatus;
  model_count: number;
  nickname: string;
  notes: string;
  attached_to_unit_id: number | null;
  weapons: Weapon[];
}

export interface UnitCreate {
  name: string;
  points_cost: number;
  movement: number;
  toughness: number;
  save: number;
  wounds: number;
  leadership: number;
  oc: number;
  status: UnitStatus;
  model_count: number;
  nickname: string;
  notes: string;
  attached_to_unit_id: number | null;
  weapons: WeaponCreate[];
}

export interface Army {
  id: number;
  name: string;
  faction: string;
  points_limit: number;
  notes: string;
  created_at: string;
  units: Unit[];
}

export interface ArmyCreate {
  name: string;
  faction: string;
  points_limit: number;
  notes: string;
}

export interface ArmyImport {
  name: string;
  faction: string;
  points_limit: number;
  notes: string;
  units: UnitCreate[];
}

export interface WeaponTemplate {
  id: number;
  unit_template_id: number;
  weapon_type: "ranged" | "melee";
  name: string;
  range: number;
  attacks: string;
  bs_ws: number;
  strength: number;
  ap: number;
  damage: string;
  special: string;
}

export interface UnitTemplate {
  id: number;
  name: string;
  source: string;
  keywords: string;
  points_cost: number;
  movement: number;
  toughness: number;
  save: number;
  wounds: number;
  leadership: number;
  oc: number;
  weapons: WeaponTemplate[];
}

export interface UnitTemplateCreate {
  name: string;
  points_cost: number;
  movement: number;
  toughness: number;
  save: number;
  wounds: number;
  leadership: number;
  oc: number;
  weapons: WeaponCreate[];
}

export interface WeaponEffectiveness {
  weapon_name: string;
  weapon_type: string;
  target_profile: string;
  p_hit: number;
  p_wound: number;
  p_fail_save: number;
  p_damage_through: number;
  expected_damage: number;
  damage_per_point: number;
}

export interface UnitEffectivenessOut {
  unit_id: number;
  unit_name: string;
  points_cost: number;
  results: WeaponEffectiveness[];
}

export interface EfficiencyRankItem {
  unit_id: number;
  unit_name: string;
  points_cost: number;
  total_expected_damage: number;
  damage_per_point: number;
}

export interface FactionRankOut {
  faction: string;
  profile: string;
  units: EfficiencyRankItem[];
}

export interface CustomProfileRequest {
  toughness: number;
  armor_save: number;
  invuln_save: number;
  fnp: number;
}

export interface WeaponCustomResult {
  weapon_name: string;
  weapon_type: string;
  p_hit: number;
  p_wound: number;
  p_fail_save: number;
  p_damage_through: number;
  expected_damage: number;
  damage_per_point: number;
}

export interface CustomProfileOut {
  unit_id: number;
  unit_name: string;
  points_cost: number;
  toughness: number;
  armor_save: number;
  invuln_save: number;
  fnp: number;
  weapons: WeaponCustomResult[];
}

export interface CustomWeaponInput {
  name: string;
  weapon_type: "ranged" | "melee";
  attacks: string;
  bs_ws: number;
  strength: number;
  ap: number;
  damage: string;
}

export interface CustomAttackerInput {
  name: string;
  points_cost: number;
  weapon: CustomWeaponInput;
}

export interface CustomDefenderInput {
  name: string;
  toughness: number;
  armor_save: number;
  invuln_save: number;
  fnp: number;
  wounds: number;
  points_cost: number;
}

export interface FlexMatchupRequest {
  attacker_template_id?: number | null;
  custom_attacker?: CustomAttackerInput | null;
  defender_template_id?: number | null;
  custom_defender?: CustomDefenderInput | null;
}

export interface FlexMatchupOut {
  attacker_name: string;
  defender_name: string;
  attacker_points: number;
  weapons: WeaponMatchupResult[];
  total_expected_damage: number;
  total_models_killed: number;
  damage_per_point: number;
}

export interface WeaponMatchupResult {
  weapon_name: string;
  weapon_type: string;
  expected_damage: number;
  models_killed: number;
  damage_per_point: number;
}

export interface TemplateMatchupOut {
  attacker: UnitTemplate;
  defender: UnitTemplate;
  weapons: WeaponMatchupResult[];
  total_expected_damage: number;
  total_models_killed: number;
}
