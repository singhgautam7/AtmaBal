"""Pydantic models mirroring the committed JSON shapes and validating rows
before they enter SQLite. A row that fails validation fails the build — it is
never silently dropped (specs/data-pipeline.md).

Keep these in lock-step with apps/web/src/data/types.ts.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Scope = Literal["public", "domestic"]
Measure = Literal["cases", "victims", "rate"]
PlaceType = Literal["women", "police", "osc", "helpline"]


class CrimeHeadRow(BaseModel):
    id: str
    name: str
    scope: Scope
    victimFactor: float = Field(gt=0)
    cases: list[float]

    @field_validator("cases")
    @classmethod
    def non_negative(cls, v: list[float]) -> list[float]:
        if any(x < 0 for x in v):
            raise ValueError("crime counts must be non-negative")
        return v


class CrimeData(BaseModel):
    city: str
    cityName: str
    years: list[int]
    populationLakh: float = Field(gt=0)
    populationBaseNote: str
    lastUpdated: str
    provisional: bool
    heads: list[CrimeHeadRow]

    @field_validator("heads")
    @classmethod
    def aligned_series(cls, heads: list[CrimeHeadRow], info) -> list[CrimeHeadRow]:
        years = info.data.get("years") or []
        for h in heads:
            if len(h.cases) != len(years):
                raise ValueError(f"head {h.id}: {len(h.cases)} points but {len(years)} years")
        return heads


class Place(BaseModel):
    id: str
    type: PlaceType
    name: str
    addr: str = ""
    phone: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    distanceLabel: str = ""
    handVerified: bool
    lastVerified: str
    source: Optional[str] = None

    @field_validator("lat")
    @classmethod
    def lat_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-90 <= v <= 90):
            raise ValueError("lat out of range")
        return v

    @field_validator("lng")
    @classmethod
    def lng_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-180 <= v <= 180):
            raise ValueError("lng out of range")
        return v


class PlacesData(BaseModel):
    city: str
    source: str
    lastUpdated: str
    places: list[Place]
