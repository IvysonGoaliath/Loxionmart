from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.booking import BookingStatus

class BookingCreate(BaseModel):
    business_id: int
    service_id: Optional[int] = None
    notes: Optional[str] = None
    preferred_date: Optional[datetime] = None

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None

class BookingOut(BaseModel):
    id: int
    client_id: int
    business_id: int
    service_id: Optional[int]
    notes: Optional[str]
    preferred_date: Optional[datetime]
    status: BookingStatus
    total_amount: Optional[float]
    created_at: datetime
    class Config:
        from_attributes = True
