from fastapi import APIRouter, Depends, HTTPException
from typing import Literal, Optional
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.models.business import Business
from app.models.user import UserRole
from app.models.service import Service
from app.schemas.mall import ShopApplication, ShopEdit, ManagedShop, ShopReview
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut
from app.routers.deps import get_current_user, require_admin
from app.routers.businesses import slugify

router = APIRouter(prefix="/merchant", tags=["merchant"])

def owned_shop(db, user, shop_id):
    shop = db.query(Business).filter(Business.id == shop_id).first()
    if not shop or (shop.owner_id != user.id and user.role != UserRole.ADMIN):
        raise HTTPException(404, "Shop not found")
    return shop

@router.get("/shops", response_model=list[ManagedShop])
def my_shops(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Business).options(selectinload(Business.services)).filter(Business.owner_id == user.id).order_by(Business.created_at.desc()).all()

@router.post("/shops", response_model=ManagedShop, status_code=201)
def apply(data: ShopApplication, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if db.query(Business).filter(Business.owner_id == user.id).count() >= 5:
        raise HTTPException(400, "You can manage up to five shops. Contact the mall administrator for help.")
    base = slugify(data.name) or "local-shop"
    slug, counter = base, 1
    while db.query(Business).filter(Business.slug == slug).first():
        counter += 1
        slug = f"{base}-{counter}"
    shop = Business(**data.model_dump(exclude={"confirms_rights"}), owner_id=user.id, slug=slug, is_active=False, approval_status="pending")
    db.add(shop); db.commit(); db.refresh(shop)
    return shop

@router.get("/shops/{shop_id}", response_model=ManagedShop)
def get_shop(shop_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return owned_shop(db,user,shop_id)

@router.put("/shops/{shop_id}", response_model=ManagedShop)
def edit_shop(shop_id: int, data: ShopEdit, db: Session = Depends(get_db), user=Depends(get_current_user)):
    shop = owned_shop(db,user,shop_id)
    for key,value in data.model_dump(exclude_unset=True).items():
        if value is not None or key in ("logo_url", "cover_url", "opening_hours", "collection_info", "delivery_info", "returns_info"):
            setattr(shop,key,value)
    db.commit(); db.refresh(shop)
    return shop

@router.post("/shops/{shop_id}/resubmit", response_model=ManagedShop)
def resubmit(shop_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    shop = owned_shop(db,user,shop_id)
    if shop.approval_status != "rejected": raise HTTPException(400,"Only a declined application can be resubmitted")
    shop.approval_status = "pending"; shop.is_active = False; shop.review_note = None
    db.commit(); db.refresh(shop)
    return shop

@router.post("/shops/{shop_id}/items", response_model=ServiceOut, status_code=201)
def add_item(shop_id: int, data: ServiceCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    owned_shop(db,user,shop_id)
    if db.query(Service).filter(Service.business_id==shop_id).count()>=1000: raise HTTPException(400,"Catalogue limit reached")
    item = Service(**data.model_dump(), business_id=shop_id)
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.put("/shops/{shop_id}/items/{item_id}", response_model=ServiceOut)
def edit_item(shop_id: int, item_id: int, data: ServiceUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    owned_shop(db,user,shop_id)
    item = db.query(Service).filter(Service.id==item_id, Service.business_id==shop_id).first()
    if not item: raise HTTPException(404,"Listing not found")
    for key,value in data.model_dump(exclude_unset=True).items():
        if value is not None or key in ("stock_quantity","duration_minutes","description"):
            setattr(item,key,value)
    db.commit(); db.refresh(item)
    return item

@router.get("/applications", response_model=list[ManagedShop])
def applications(status: Optional[Literal["pending", "approved", "rejected"]] = None,
                 db: Session = Depends(get_db), admin=Depends(require_admin)):
    query = db.query(Business).options(selectinload(Business.services))
    if status:
        query = query.filter(Business.approval_status == status)
        if status == "approved":
            query = query.filter(Business.owner_id.isnot(None))
    else:
        query = query.filter(Business.approval_status != "approved")
    return query.order_by(Business.created_at).all()

@router.put("/applications/{shop_id}", response_model=ManagedShop)
def review(shop_id: int, data: ShopReview, db: Session = Depends(get_db), admin=Depends(require_admin)):
    shop = db.query(Business).filter(Business.id==shop_id).first()
    if not shop: raise HTTPException(404,"Shop not found")
    shop.approval_status = data.decision; shop.review_note = data.note
    shop.is_active = data.decision == "approved"
    db.commit(); db.refresh(shop)
    return shop

@router.get("/shops/{shop_id}/bookings")
def shop_bookings(shop_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    from app.models.booking import Booking
    owned_shop(db,user,shop_id)
    rows=db.query(Booking).filter(Booking.business_id==shop_id).order_by(Booking.created_at.desc()).limit(200).all()
    return [{"id":b.id,"status":b.status,"preferred_date":b.preferred_date,"notes":b.notes,"client_name":b.client.full_name,"service_name":b.service.name if b.service else None} for b in rows]

from pydantic import BaseModel
class MerchantBookingUpdate(BaseModel):
    status: Literal["confirmed", "completed", "cancelled"]

@router.put("/shops/{shop_id}/bookings/{booking_id}")
def update_shop_booking(shop_id: int, booking_id: int, data: MerchantBookingUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    from app.models.booking import Booking, BookingStatus
    owned_shop(db,user,shop_id)
    row=db.query(Booking).filter(Booking.id==booking_id,Booking.business_id==shop_id).first()
    if not row: raise HTTPException(404,"Booking not found")
    allowed={"pending":{"confirmed","cancelled"},"confirmed":{"completed","cancelled"}}
    if data.status not in allowed.get(row.status.value,set()): raise HTTPException(409,"This booking cannot move to that status")
    row.status=BookingStatus(data.status)
    db.commit()
    return {"updated":True}
