from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, cast, String
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.business import Business, BusinessCategory
from app.models.service import Service, ServiceType
from app.schemas.mall import CatalogueItem, CataloguePage, ShopSummary
from pydantic import BaseModel

router = APIRouter(prefix="/catalogue", tags=["catalogue"])

def public_items(db):
    return db.query(Service).join(Business).options(joinedload(Service.business)).filter(Business.is_active.is_(True), Business.approval_status == "approved", Service.is_available.is_(True))

@router.get("", response_model=CataloguePage)
def catalogue(q: str = Query("", max_length=180), kind: Optional[ServiceType] = None, category: Optional[BusinessCategory] = None,
              location: str = Query("", max_length=180), min_price: Optional[float] = Query(None, ge=0), max_price: Optional[float] = Query(None, ge=0),
              available: bool = False, shop_id: Optional[int] = None, sort: Literal["newest", "price_asc", "price_desc", "name"] = "newest",
              page: int = Query(1, ge=1), page_size: int = Query(24, ge=1, le=60), db: Session = Depends(get_db)):
    query = public_items(db)
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(422, "Minimum price must not exceed maximum price")
    if q.strip():
        pattern = "%" + q.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        query = query.filter(or_(*[col.ilike(pattern, escape="\\") for col in (Service.name, Service.description, Business.name, Business.location, cast(Service.specifications, String))]))
    if kind: query = query.filter(Service.service_type == kind)
    if category: query = query.filter(Business.category == category)
    if location.strip(): query = query.filter(Business.location.ilike("%" + location.strip().replace("%", "").replace("_", "") + "%"))
    if shop_id: query = query.filter(Service.business_id == shop_id)
    if min_price is not None: query = query.filter(Service.price >= min_price)
    if max_price is not None: query = query.filter(Service.price <= max_price)
    if available: query = query.filter(or_(Service.stock_quantity.is_(None), Service.stock_quantity > 0, Service.service_type == ServiceType.BOOKING))
    total = query.count()
    ordering = {"newest": Service.created_at.desc(), "price_asc": Service.price.asc(), "price_desc": Service.price.desc(), "name": Service.name.asc()}[sort]
    return {"items": query.order_by(ordering, Service.id.desc()).offset((page-1)*page_size).limit(page_size).all(), "total": total, "page": page, "page_size": page_size}

class DirectoryShop(ShopSummary):
    description: Optional[str] = None
    cover_url: Optional[str] = None
    is_featured: bool

class DirectoryPage(BaseModel):
    items: list[DirectoryShop]
    total: int
    page: int
    page_size: int

@router.get("/shops", response_model=DirectoryPage)
def shop_directory(q: str = Query("", max_length=180), category: Optional[BusinessCategory] = None,
                   page: int = Query(1, ge=1), page_size: int = Query(24, ge=1, le=60), db: Session = Depends(get_db)):
    query = db.query(Business).filter(Business.is_active.is_(True), Business.approval_status == "approved")
    if q.strip():
        pattern = "%" + q.strip().replace("%", "").replace("_", "") + "%"
        query = query.filter(or_(Business.name.ilike(pattern), Business.description.ilike(pattern), Business.location.ilike(pattern)))
    if category: query = query.filter(Business.category == category)
    total = query.count()
    return {"items":query.order_by(Business.is_featured.desc(),Business.name, Business.id).offset((page-1)*page_size).limit(page_size).all(),"total":total,"page":page,"page_size":page_size}

@router.get("/{item_id}", response_model=CatalogueItem)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = public_items(db).filter(Service.id == item_id).first()
    if not item: raise HTTPException(404, "This listing is no longer available")
    return item
