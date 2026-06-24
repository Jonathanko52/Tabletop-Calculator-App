from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/armies", tags=["armies"])


@router.get("/", response_model=list[schemas.ArmyOut])
def list_armies(db: Session = Depends(get_db)):
    return db.query(models.Army).order_by(models.Army.created_at.desc()).all()


@router.get("/{army_id}", response_model=schemas.ArmyOut)
def get_army(army_id: int, db: Session = Depends(get_db)):
    army = db.query(models.Army).filter(models.Army.id == army_id).first()
    if not army:
        raise HTTPException(status_code=404, detail="Army not found")
    return army


@router.post("/", response_model=schemas.ArmyOut, status_code=201)
def create_army(payload: schemas.ArmyCreate, db: Session = Depends(get_db)):
    army = models.Army(**payload.model_dump())
    db.add(army)
    db.commit()
    db.refresh(army)
    return army


@router.put("/{army_id}", response_model=schemas.ArmyOut)
def update_army(army_id: int, payload: schemas.ArmyUpdate, db: Session = Depends(get_db)):
    army = db.query(models.Army).filter(models.Army.id == army_id).first()
    if not army:
        raise HTTPException(status_code=404, detail="Army not found")
    for key, value in payload.model_dump().items():
        setattr(army, key, value)
    db.commit()
    db.refresh(army)
    return army


@router.delete("/{army_id}", status_code=204)
def delete_army(army_id: int, db: Session = Depends(get_db)):
    army = db.query(models.Army).filter(models.Army.id == army_id).first()
    if not army:
        raise HTTPException(status_code=404, detail="Army not found")
    db.delete(army)
    db.commit()
