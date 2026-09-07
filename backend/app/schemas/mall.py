from typing import Optional, Literal, List
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.models.business import BusinessCategory
from .business import BusinessOut, ShopPresentation
from .service import ServiceOut

class ShopSummary(BaseModel):
    id: int
    name: str
    slug: str
    category: BusinessCategory
    location: Optional[str] = None
    logo_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    collection_info: Optional[str] = None
    delivery_info: Optional[str] = None
    returns_info: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CatalogueItem(ServiceOut):
    business: ShopSummary

class CataloguePage(BaseModel):
    items: List[CatalogueItem]
    total: int
    page: int
    page_size: int

class ShopApplication(ShopPresentation):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str = Field(min_length=2, max_length=120)
    category: BusinessCategory
    description: str = Field(min_length=20, max_length=6000)
    location: str = Field(min_length=2, max_length=180)
    whatsapp_number: str = Field(pattern=r"^\+?[0-9]{10,15}$")
    confirms_rights: Literal[True]

class ShopEdit(ShopPresentation):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, min_length=20, max_length=6000)
    location: Optional[str] = Field(default=None, min_length=2, max_length=180)
    whatsapp_number: Optional[str] = Field(default=None, pattern=r"^\+?[0-9]{10,15}$")

class ManagedShop(BusinessOut):
    approval_status: str
    review_note: Optional[str] = None
    owner_id: Optional[int] = None

class ShopReview(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    decision: Literal["approved", "rejected"]
    note: str = Field(default="", max_length=1500)

    @model_validator(mode="after")
    def rejection_requires_reason(self):
        if self.decision == "rejected" and not self.note:
            raise ValueError("Explain why the application is rejected so the owner can address it.")
        return self

class SaveRequest(BaseModel):
    kind: Literal["item", "shop"]
    target_id: int = Field(gt=0)
