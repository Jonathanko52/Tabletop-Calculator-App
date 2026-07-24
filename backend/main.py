import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, SessionLocal, get_db
import models
import schemas
from routers import armies, units, unit_templates
from effectiveness.calculator import TARGET_PROFILES, calculate_weapon_damage, calculate_weapon_matchup

models.Base.metadata.create_all(bind=engine)

FACTIONS_DIR = Path(__file__).parent.parent / "factions"


def seed_templates(db: Session) -> None:
    if not FACTIONS_DIR.exists():
        return
    existing = {t.name for t in db.query(models.UnitTemplate).all()}
    for json_file in sorted(FACTIONS_DIR.glob("*.json")):
        source = json_file.stem
        for unit_data in json.loads(json_file.read_text()):
            if unit_data.get("name") in existing:
                continue
            weapons = unit_data.pop("weapons", [])
            tmpl = models.UnitTemplate(source=source, **unit_data)
            db.add(tmpl)
            db.flush()
            for w in weapons:
                db.add(models.WeaponTemplate(unit_template_id=tmpl.id, **w))
            existing.add(unit_data["name"])
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_templates(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Tabletop War Game Manager", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(armies.router)
app.include_router(units.router)
app.include_router(unit_templates.router)


@app.get("/effectiveness/template/{template_id}", response_model=schemas.UnitEffectivenessOut)
def get_template_effectiveness(template_id: int, db: Session = Depends(get_db)):
    tmpl = db.query(models.UnitTemplate).filter(models.UnitTemplate.id == template_id).first()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Unit template not found")

    results: list[schemas.WeaponEffectiveness] = []
    for weapon in tmpl.weapons:
        per_profile = calculate_weapon_damage(
            attacks=weapon.attacks,
            bs_ws=weapon.bs_ws,
            strength=weapon.strength,
            ap=weapon.ap,
            damage=weapon.damage,
            points_cost=tmpl.points_cost,
        )
        for entry in per_profile:
            results.append(schemas.WeaponEffectiveness(
                weapon_name=weapon.name,
                weapon_type=weapon.weapon_type,
                target_profile=entry["target_profile"],
                expected_damage=entry["expected_damage"],
                damage_per_point=entry["damage_per_point"],
            ))

    return schemas.UnitEffectivenessOut(
        unit_id=tmpl.id,
        unit_name=tmpl.name,
        points_cost=tmpl.points_cost,
        results=results,
    )



@app.get("/effectiveness/faction/{faction}/ranking", response_model=schemas.FactionRankOut)
def get_faction_ranking(
    faction: str,
    profile: str = Query(default="T4 3+"),
    db: Session = Depends(get_db),
):
    valid_profiles = {p[0] for p in TARGET_PROFILES}
    if profile not in valid_profiles:
        raise HTTPException(status_code=400, detail=f"Unknown profile '{profile}'. Valid: {sorted(valid_profiles)}")

    templates = db.query(models.UnitTemplate).filter(models.UnitTemplate.source == faction).all()

    items: list[schemas.EfficiencyRankItem] = []
    for tmpl in templates:
        if not tmpl.weapons:
            continue
        total_dmg = 0.0
        for weapon in tmpl.weapons:
            per_profile = calculate_weapon_damage(
                attacks=weapon.attacks,
                bs_ws=weapon.bs_ws,
                strength=weapon.strength,
                ap=weapon.ap,
                damage=weapon.damage,
                points_cost=tmpl.points_cost,
            )
            for entry in per_profile:
                if entry["target_profile"] == profile:
                    total_dmg += entry["expected_damage"]
                    break
        dpp = round(total_dmg / tmpl.points_cost, 4) if tmpl.points_cost > 0 else 0.0
        items.append(schemas.EfficiencyRankItem(
            unit_id=tmpl.id,
            unit_name=tmpl.name,
            points_cost=tmpl.points_cost,
            total_expected_damage=round(total_dmg, 3),
            damage_per_point=dpp,
        ))

    items.sort(key=lambda x: x.damage_per_point, reverse=True)
    return schemas.FactionRankOut(faction=faction, profile=profile, units=items)



@app.post("/effectiveness/matchup-templates", response_model=schemas.TemplateMatchupOut)
def get_template_matchup(payload: schemas.MatchupTemplateRequest, db: Session = Depends(get_db)):
    attacker = db.query(models.UnitTemplate).filter(models.UnitTemplate.id == payload.attacker_template_id).first()
    defender = db.query(models.UnitTemplate).filter(models.UnitTemplate.id == payload.defender_template_id).first()
    if not attacker:
        raise HTTPException(status_code=404, detail="Attacker template not found")
    if not defender:
        raise HTTPException(status_code=404, detail="Defender template not found")

    weapon_results = []
    for weapon in attacker.weapons:
        r = calculate_weapon_matchup(
            attacks=weapon.attacks,
            bs_ws=weapon.bs_ws,
            strength=weapon.strength,
            ap=weapon.ap,
            damage=weapon.damage,
            attacker_points=attacker.points_cost,
            defender_toughness=defender.toughness,
            defender_save=defender.save,
            defender_wounds=defender.wounds,
        )
        weapon_results.append(schemas.WeaponMatchupResult(
            weapon_name=weapon.name,
            weapon_type=weapon.weapon_type,
            **r,
        ))

    total_dmg    = round(sum(w.expected_damage for w in weapon_results), 3)
    total_killed = round(total_dmg / defender.wounds, 3) if defender.wounds > 0 else 0.0

    return schemas.TemplateMatchupOut(
        attacker=attacker,
        defender=defender,
        weapons=weapon_results,
        total_expected_damage=total_dmg,
        total_models_killed=total_killed,
    )


@app.post("/effectiveness/matchup", response_model=schemas.MatchupOut)
def get_matchup(payload: schemas.MatchupRequest, db: Session = Depends(get_db)):
    attacker = db.query(models.Unit).filter(models.Unit.id == payload.attacker_id).first()
    defender = db.query(models.Unit).filter(models.Unit.id == payload.defender_id).first()
    if not attacker:
        raise HTTPException(status_code=404, detail="Attacker not found")
    if not defender:
        raise HTTPException(status_code=404, detail="Defender not found")

    weapon_results = []
    for weapon in attacker.weapons:
        r = calculate_weapon_matchup(
            attacks=weapon.attacks,
            bs_ws=weapon.bs_ws,
            strength=weapon.strength,
            ap=weapon.ap,
            damage=weapon.damage,
            attacker_points=attacker.points_cost,
            defender_toughness=defender.toughness,
            defender_save=defender.save,
            defender_wounds=defender.wounds,
        )
        weapon_results.append(schemas.WeaponMatchupResult(
            weapon_name=weapon.name,
            weapon_type=weapon.weapon_type,
            **r,
        ))

    total_dmg    = round(sum(w.expected_damage for w in weapon_results), 3)
    total_killed = round(total_dmg / defender.wounds, 3) if defender.wounds > 0 else 0.0

    return schemas.MatchupOut(
        attacker=attacker,
        defender=defender,
        weapons=weapon_results,
        total_expected_damage=total_dmg,
        total_models_killed=total_killed,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
