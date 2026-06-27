from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Army(Base):
    __tablename__ = "armies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    faction = Column(String, nullable=False)
    points_limit = Column(Integer, default=2000)
    created_at = Column(DateTime, default=datetime.utcnow)

    units = relationship("Unit", back_populates="army", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    army_id = Column(Integer, ForeignKey("armies.id"), nullable=False)
    name = Column(String, nullable=False)
    points_cost = Column(Integer, nullable=False, default=0)
    movement = Column(Integer, default=6)
    toughness = Column(Integer, default=4)
    save = Column(Integer, default=4)
    wounds = Column(Integer, default=1)
    leadership = Column(Integer, default=7)
    oc = Column(Integer, default=1)

    army = relationship("Army", back_populates="units")
    weapons = relationship("Weapon", back_populates="unit", cascade="all, delete-orphan")


class Weapon(Base):
    __tablename__ = "weapons"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    weapon_type = Column(String, nullable=False, default="ranged")  # 'ranged' | 'melee'
    name = Column(String, nullable=False)
    range = Column(Integer, default=0)
    attacks = Column(String, default="1")   # e.g. "3" or "D6"
    bs_ws = Column(Integer, default=4)      # ballistic/weapon skill
    strength = Column(Integer, default=4)
    ap = Column(Integer, default=0)
    damage = Column(String, default="1")    # e.g. "2" or "D3"
    special = Column(String, default="")

    unit = relationship("Unit", back_populates="weapons")


class UnitTemplate(Base):
    __tablename__ = "unit_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    points_cost = Column(Integer, nullable=False, default=0)
    movement = Column(Integer, default=6)
    toughness = Column(Integer, default=4)
    save = Column(Integer, default=4)
    wounds = Column(Integer, default=1)
    leadership = Column(Integer, default=7)
    oc = Column(Integer, default=1)

    weapons = relationship("WeaponTemplate", back_populates="unit_template", cascade="all, delete-orphan")


class WeaponTemplate(Base):
    __tablename__ = "weapon_templates"

    id = Column(Integer, primary_key=True, index=True)
    unit_template_id = Column(Integer, ForeignKey("unit_templates.id"), nullable=False)
    weapon_type = Column(String, nullable=False, default="ranged")
    name = Column(String, nullable=False)
    range = Column(Integer, default=0)
    attacks = Column(String, default="1")
    bs_ws = Column(Integer, default=4)
    strength = Column(Integer, default=4)
    ap = Column(Integer, default=0)
    damage = Column(String, default="1")
    special = Column(String, default="")

    unit_template = relationship("UnitTemplate", back_populates="weapons")
