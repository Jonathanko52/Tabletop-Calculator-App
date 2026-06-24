from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/units", tags=["units"])


@router.get("/", response_model=list[schemas.UnitOut])
def list_units(army_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Unit)
    if army_id is not None:
        q = q.filter(models.Unit.army_id == army_id)
    return q.all()


@router.get("/{unit_id}", response_model=schemas.UnitOut)
def get_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit


@router.post("/{army_id}", response_model=schemas.UnitOut, status_code=201)
def create_unit(army_id: int, payload: schemas.UnitCreate, db: Session = Depends(get_db)):
    army = db.query(models.Army).filter(models.Army.id == army_id).first()
    if not army:
        raise HTTPException(status_code=404, detail="Army not found")

    weapons_data = payload.model_dump().pop("weapons", [])
    unit = models.Unit(army_id=army_id, **{k: v for k, v in payload.model_dump().items() if k != "weapons"})
    db.add(unit)
    db.flush()

    for w in weapons_data:
        db.add(models.Weapon(unit_id=unit.id, **w))

    db.commit()
    db.refresh(unit)
    return unit


@router.put("/{unit_id}", response_model=schemas.UnitOut)
def update_unit(unit_id: int, payload: schemas.UnitUpdate, db: Session = Depends(get_db)):
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    data = payload.model_dump()
    weapons_data = data.pop("weapons", [])

    for key, value in data.items():
        setattr(unit, key, value)

    # Replace weapons wholesale
    db.query(models.Weapon).filter(models.Weapon.unit_id == unit_id).delete()
    for w in weapons_data:
        db.add(models.Weapon(unit_id=unit_id, **w))

    db.commit()
    db.refresh(unit)
    return unit


@router.delete("/{unit_id}", status_code=204)
def delete_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    db.delete(unit)
    db.commit()
