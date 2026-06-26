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
  weapons: WeaponCreate[];
}

export interface Army {
  id: number;
  name: string;
  faction: string;
  points_limit: number;
  created_at: string;
  units: Unit[];
}

export interface ArmyCreate {
  name: string;
  faction: string;
  points_limit: number;
}

export interface ArmyImport {
  name: string;
  faction: string;
  points_limit: number;
  units: UnitCreate[];
}

export interface WeaponEffectiveness {
  weapon_name: string;
  weapon_type: string;
  target_profile: string;
  expected_damage: number;
  damage_per_point: number;
}

export interface UnitEffectivenessOut {
  unit_id: number;
  unit_name: string;
  points_cost: number;
  results: WeaponEffectiveness[];
}
