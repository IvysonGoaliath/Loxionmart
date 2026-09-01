from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.business import Business, BusinessCategory
from app.schemas.business import BusinessCreate, BusinessUpdate, BusinessOut
from app.routers.deps import require_admin
import re

router = APIRouter(prefix="/businesses", tags=["businesses"])

def slugify(name: str) -> str:
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug.strip('-')

@router.get("/", response_model=List[BusinessOut])
def list_businesses(
    category: Optional[BusinessCategory] = None,
    featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Business).filter(Business.is_active == True)
    if category:
        q = q.filter(Business.category == category)
    if featured is not None:
        q = q.filter(Business.is_featured == featured)
    return q.order_by(Business.is_featured.desc(), Business.name).all()

@router.get("/{slug}", response_model=BusinessOut)
def get_business(slug: str, db: Session = Depends(get_db)):
    biz = db.query(Business).filter(Business.slug == slug, Business.is_active == True).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return biz

@router.post("/", response_model=BusinessOut, status_code=201)
def create_business(data: BusinessCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    base_slug = slugify(data.name)
    slug = base_slug
    counter = 1
    while db.query(Business).filter(Business.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    biz = Business(**data.model_dump(), slug=slug)
    db.add(biz)
    db.commit()
    db.refresh(biz)
    return biz

@router.put("/{id}", response_model=BusinessOut)
def update_business(id: int, data: BusinessUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    biz = db.query(Business).filter(Business.id == id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(biz, k, v)
    db.commit()
    db.refresh(biz)
    return biz

@router.delete("/{id}", status_code=204)
def delete_business(id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    biz = db.query(Business).filter(Business.id == id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    biz.is_active = False
    db.commit()
