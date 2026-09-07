from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.business import BusinessCategory
from .service import ServiceOut

class BusinessCreate(BaseModel):
    name: str
    category: BusinessCategory
    description: Optional[str] = None
    location: Optional[str] = None
    whatsapp_number: Optional[str] = None
    banner_color: Optional[str] = "#1e8a4e"
    emoji: Optional[str] = "🏪"
    commission_rate: Optional[float] = 0.10
    is_featured: Optional[bool] = False

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[BusinessCategory] = None
    description: Optional[str] = None
    location: Optional[str] = None
    whatsapp_number: Optional[str] = None
    banner_color: Optional[str] = None
    emoji: Optional[str] = None
    commission_rate: Optional[float] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class ShopPresentation(BaseModel):
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    opening_hours: Optional[str] = Field(default=None, max_length=1000)
    collection_info: Optional[str] = Field(default=None, max_length=2000)
    delivery_info: Optional[str] = Field(default=None, max_length=2000)
    returns_info: Optional[str] = Field(default=None, max_length=3000)

    @field_validator("logo_url", "cover_url")
    @classmethod
    def validate_image(cls, value):
        from .media import image_url
        return image_url(value)

class BusinessOut(ShopPresentation):
    id: int
    name: str
    slug: str
    category: BusinessCategory
    description: Optional[str]
    location: Optional[str]
    whatsapp_number: Optional[str]
    banner_color: str
    emoji: str
    commission_rate: float
    is_featured: bool
    is_active: bool
    created_at: datetime
    services: List[ServiceOut] = []
    class Config:
        from_attributes = True
