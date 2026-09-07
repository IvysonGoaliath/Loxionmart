from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict
from datetime import datetime
from app.models.service import ServiceType
from .media import image_url

class ListingFields(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    image_urls: List[str] = Field(default_factory=list, max_length=8)
    specifications: Dict[str, str] = Field(default_factory=dict)
    stock_quantity: Optional[int] = Field(default=None, ge=0, le=1000000)
    duration_minutes: Optional[int] = Field(default=None, ge=1, le=10080)

    @field_validator("image_urls")
    @classmethod
    def validate_images(cls, value):
        return [image_url(v) for v in value if v]

    @field_validator("specifications")
    @classmethod
    def validate_specs(cls, value):
        if len(value)>30 or any(not k.strip() or len(k)>80 or len(v)>500 for k,v in value.items()):
            raise ValueError("Use up to 30 specifications, with a short label and value")
        return value

class ServiceCreate(ListingFields):
    name: str = Field(min_length=2, max_length=180)
    description: Optional[str] = Field(default=None, max_length=12000)
    price: float = Field(ge=0, le=10000000, allow_inf_nan=False)
    emoji: str = Field(default="🛍️", max_length=12)
    service_type: ServiceType = ServiceType.BOOKING
    is_available: bool = True

class ServiceUpdate(ListingFields):
    name: Optional[str] = Field(default=None, min_length=2, max_length=180)
    description: Optional[str] = Field(default=None, max_length=12000)
    price: Optional[float] = Field(default=None, ge=0, le=10000000, allow_inf_nan=False)
    emoji: Optional[str] = Field(default=None, max_length=12)
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
    image_urls: List[str] = Field(default_factory=list)
    specifications: Dict[str, str] = Field(default_factory=dict)
    stock_quantity: Optional[int] = None
    duration_minutes: Optional[int] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
