from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.models.business import Business
from app.models.order import Order, OrderStatus
from app.models.commission import Commission, CommissionStatus
from app.schemas.user import UserOut
from app.schemas.business import BusinessOut
from app.routers.deps import require_admin
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class CommissionStatusUpdate(BaseModel):
    status: CommissionStatus

# ── Businesses ──
@router.get("/businesses", response_model=List[BusinessOut])
def list_admin_businesses(db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Include hidden businesses so administrators can reactivate them."""
    return db.query(Business).order_by(Business.is_featured.desc(), Business.name).all()


# ── Users ──
@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()

# ── Orders ──
@router.put("/orders/{order_id}")
def update_order_status(order_id: int, data: OrderStatusUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    if data.status == OrderStatus.PAID and not order.paid_at:
        order.paid_at = datetime.utcnow()
    db.commit()
    return {"ok": True}

# ── Commissions ──
class CommissionOut(BaseModel):
    id: int
    business_id: int
    order_id: Optional[int]
    amount: float
    rate: float
    status: CommissionStatus
    created_at: datetime
    paid_out_at: Optional[datetime]
    class Config:
        from_attributes = True

@router.get("/commissions", response_model=List[CommissionOut])
def list_commissions(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(Commission).order_by(Commission.created_at.desc()).all()

@router.put("/commissions/{commission_id}")
def update_commission(commission_id: int, data: CommissionStatusUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    comm = db.query(Commission).filter(Commission.id == commission_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Commission not found")
    comm.status = data.status
    if data.status == CommissionStatus.PAID_OUT:
        comm.paid_out_at = datetime.utcnow()
    db.commit()
    return {"ok": True}
