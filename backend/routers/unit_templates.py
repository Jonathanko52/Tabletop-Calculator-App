from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/unit-templates", tags=["unit-templates"])


@router.get("/", response_model=list[schemas.UnitTemplateOut])
def list_templates(db: Session = Depends(get_db)):
    return db.query(models.UnitTemplate).order_by(models.UnitTemplate.name).all()


@router.post("/", response_model=schemas.UnitTemplateOut, status_code=201)
def create_template(payload: schemas.UnitTemplateCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    weapons_data = data.pop("weapons", [])
    template = models.UnitTemplate(**data)
    db.add(template)
    db.flush()
    for w in weapons_data:
        db.add(models.WeaponTemplate(unit_template_id=template.id, **w))
    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(models.UnitTemplate).filter(models.UnitTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(template)
    db.commit()


@router.post("/import", response_model=list[schemas.UnitTemplateOut], status_code=201)
def import_templates(payload: list[schemas.UnitTemplateCreate], db: Session = Depends(get_db)):
    created = []
    for item in payload:
        data = item.model_dump()
        weapons_data = data.pop("weapons", [])
        template = models.UnitTemplate(**data)
        db.add(template)
        db.flush()
        for w in weapons_data:
            db.add(models.WeaponTemplate(unit_template_id=template.id, **w))
        db.refresh(template)
        created.append(template)
    db.commit()
    for t in created:
        db.refresh(t)
    return created
