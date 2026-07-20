from datetime import datetime
from typing import Optional
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
    status: str = "unpainted"
    model_count: int = 1
    nickname: str = ""
    notes: str = ""
    attached_to_unit_id: Optional[int] = None


class UnitCreate(UnitBase):
    weapons: list[WeaponCreate] = []


class UnitUpdate(UnitBase):
    weapons: list[WeaponCreate] = []


class UnitOut(UnitBase):
    id: int
    army_id: int
    weapons: list[WeaponOut] = []

    model_config = {"from_attributes": True}


class UnitStatusUpdate(BaseModel):
    status: str


class UnitChapterUpdate(BaseModel):
    nickname: str = ""
    notes: str = ""
    attached_to_unit_id: Optional[int] = None


# --- Army ---

class ArmyBase(BaseModel):
    name: str
    faction: str
    points_limit: int = 2000
    notes: str = ""


class ArmyCreate(ArmyBase):
    pass


class ArmyUpdate(ArmyBase):
    pass


class ArmyOut(ArmyBase):
    id: int
    created_at: datetime
    units: list[UnitOut] = []

    model_config = {"from_attributes": True}


# --- Import ---

class ArmyImport(BaseModel):
    name: str
    faction: str
    points_limit: int = 2000
    units: list[UnitCreate] = []


# --- Unit Templates ---

class WeaponTemplateOut(WeaponBase):
    id: int
    unit_template_id: int

    model_config = {"from_attributes": True}


class UnitTemplateBase(BaseModel):
    name: str
    source: str = ""
    keywords: str = ""
    points_cost: int = 0
    movement: int = 6
    toughness: int = 4
    save: int = 4
    wounds: int = 1
    leadership: int = 7
    oc: int = 1


class UnitTemplateCreate(UnitTemplateBase):
    weapons: list[WeaponCreate] = []


class UnitTemplateOut(UnitTemplateBase):
    id: int
    weapons: list[WeaponTemplateOut] = []

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


# --- Efficiency Ranking ---

class EfficiencyRankItem(BaseModel):
    unit_id: int
    unit_name: str
    points_cost: int
    total_expected_damage: float
    damage_per_point: float


class EfficiencyRankOut(BaseModel):
    army_id: int
    profile: str
    units: list[EfficiencyRankItem]


class FactionRankOut(BaseModel):
    faction: str
    profile: str
    units: list[EfficiencyRankItem]


# --- Match-up ---

class MatchupRequest(BaseModel):
    attacker_id: int
    defender_id: int


class MatchupTemplateRequest(BaseModel):
    attacker_template_id: int
    defender_template_id: int


class WeaponMatchupResult(BaseModel):
    weapon_name: str
    weapon_type: str
    expected_damage: float
    models_killed: float
    damage_per_point: float


class MatchupOut(BaseModel):
    attacker: UnitOut
    defender: UnitOut
    weapons: list[WeaponMatchupResult]
    total_expected_damage: float
    total_models_killed: float


class TemplateMatchupOut(BaseModel):
    attacker: UnitTemplateOut
    defender: UnitTemplateOut
    weapons: list[WeaponMatchupResult]
    total_expected_damage: float
    total_models_killed: float
