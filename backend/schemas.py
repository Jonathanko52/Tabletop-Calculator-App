from datetime import datetime
from pydantic import BaseModel


# --- Weapon ---

class WeaponBase(BaseModel):
    weapon_type: str = "ranged"
    name: str
    range: int = 0
    attacks: str = "1"
    bs_ws: int = 4
    strength: int = 4
    ap: int = 0
    damage: str = "1"
    special: str = ""


class WeaponCreate(WeaponBase):
    pass


class WeaponUpdate(WeaponBase):
    pass


class WeaponOut(WeaponBase):
    id: int
    unit_id: int

    model_config = {"from_attributes": True}


# --- Unit ---

class UnitBase(BaseModel):
    name: str
    points_cost: int = 0
    movement: int = 6
    toughness: int = 4
    save: int = 4
    wounds: int = 1
    leadership: int = 7
    oc: int = 1


class UnitCreate(UnitBase):
    weapons: list[WeaponCreate] = []


class UnitUpdate(UnitBase):
    weapons: list[WeaponCreate] = []


class UnitOut(UnitBase):
    id: int
    army_id: int
    weapons: list[WeaponOut] = []

    model_config = {"from_attributes": True}


# --- Army ---

class ArmyBase(BaseModel):
    name: str
    faction: str
    points_limit: int = 2000


class ArmyCreate(ArmyBase):
    pass


class ArmyUpdate(ArmyBase):
    pass


class ArmyOut(ArmyBase):
    id: int
    created_at: datetime
    units: list[UnitOut] = []

    model_config = {"from_attributes": True}


# --- Effectiveness ---

class WeaponEffectiveness(BaseModel):
    weapon_name: str
    weapon_type: str
    target_profile: str
    expected_damage: float
    damage_per_point: float


class UnitEffectivenessOut(BaseModel):
    unit_id: int
    unit_name: str
    points_cost: int
    results: list[WeaponEffectiveness]
