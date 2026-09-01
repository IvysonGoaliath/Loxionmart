from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.service import ServiceType

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    emoji: Optional[str] = "🛍️"
    service_type: Optional[ServiceType] = ServiceType.BOOKING
    is_available: Optional[bool] = True

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    emoji: Optional[str] = None
    service_type: Optional[ServiceType] = None
    is_available: Optional[bool] = None

class ServiceOut(BaseModel):
    id: int
    business_id: int
    name: str
    description: Optional[str]
    price: float
    emoji: str
    service_type: ServiceType
    is_available: bool
    class Config:
        from_attributes = True
