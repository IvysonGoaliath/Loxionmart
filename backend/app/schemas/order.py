from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus

class CartItem(BaseModel):
    service_id: int
    quantity: int = Field(default=1, ge=1, le=99)

class OrderCreate(BaseModel):
    business_id: int
    items: List[CartItem] = Field(min_length=1, max_length=100)
    notes: Optional[str] = None

class OrderItemOut(BaseModel):
    id: int
    service_id: int
    quantity: int
    unit_price: float
    total_price: float
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    client_id: int
    business_id: int
    status: OrderStatus
    subtotal: float
    commission_amount: float
    total_amount: float
    ozow_payment_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    paid_at: Optional[datetime]
    items: List[OrderItemOut] = []
    class Config:
        from_attributes = True
