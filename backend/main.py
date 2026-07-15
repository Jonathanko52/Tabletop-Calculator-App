import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, SessionLocal, get_db
import models
import schemas
from routers import armies, units, unit_templates
from effectiveness.calculator import calculate_weapon_damage, calculate_weapon_matchup

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


@app.get("/effectiveness/{unit_id}", response_model=schemas.UnitEffectivenessOut)
def get_unit_effectiveness(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    results: list[schemas.WeaponEffectiveness] = []

    for weapon in unit.weapons:
        per_profile = calculate_weapon_damage(
            attacks=weapon.attacks,
            bs_ws=weapon.bs_ws,
            strength=weapon.strength,
            ap=weapon.ap,
            damage=weapon.damage,
            points_cost=unit.points_cost,
        )
        for entry in per_profile:
            results.append(
                schemas.WeaponEffectiveness(
                    weapon_name=weapon.name,
                    weapon_type=weapon.weapon_type,
                    target_profile=entry["target_profile"],
                    expected_damage=entry["expected_damage"],
                    damage_per_point=entry["damage_per_point"],
                )
            )

    return schemas.UnitEffectivenessOut(
        unit_id=unit.id,
        unit_name=unit.name,
        points_cost=unit.points_cost,
        results=results,
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
