from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.models.mall import SavedItem
from app.models.business import Business
from app.models.service import Service
from app.schemas.mall import SaveRequest, CatalogueItem
from app.schemas.business import BusinessOut
from app.routers.businesses import public_business
from app.routers.catalogue import public_items
from app.routers.deps import get_current_user

router = APIRouter(prefix="/saved", tags=["saved"])

@router.get("")
def saved(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(SavedItem).filter(SavedItem.user_id==user.id).order_by(SavedItem.created_at.desc()).all()
    item_ids = [r.target_id for r in rows if r.kind=="item"]
    shop_ids = [r.target_id for r in rows if r.kind=="shop"]
    items = {i.id:i for i in public_items(db).filter(Service.id.in_(item_ids)).all()} if item_ids else {}
    shops = {b.id:b for b in db.query(Business).filter(Business.id.in_(shop_ids), Business.is_active.is_(True), Business.approval_status=="approved").all()} if shop_ids else {}
    return {"keys":[f"{r.kind}:{r.target_id}" for r in rows], "items":[CatalogueItem.model_validate(items[i]) for i in item_ids if i in items], "shops":[public_business(shops[i]) for i in shop_ids if i in shops], "unavailable_count":len(rows)-len(items)-len(shops)}

@router.put("", status_code=201)
def save(data: SaveRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if data.kind=="item": exists=public_items(db).filter(Service.id==data.target_id).first()
    else: exists=db.query(Business).filter(Business.id==data.target_id, Business.is_active.is_(True), Business.approval_status=="approved").first()
    if not exists: raise HTTPException(404,"Listing or shop is unavailable")
    if db.query(SavedItem).filter(SavedItem.user_id==user.id).count()>=1000: raise HTTPException(400,"Collection is full. Remove an old save to add another.")
    if not db.query(SavedItem).filter_by(user_id=user.id,kind=data.kind,target_id=data.target_id).first():
        db.add(SavedItem(user_id=user.id, **data.model_dump()))
        try: db.commit()
        except IntegrityError: db.rollback()
    return {"saved":True}

@router.delete("/{kind}/{target_id}", status_code=204)
def unsave(kind: str, target_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db.query(SavedItem).filter_by(user_id=user.id,kind=kind,target_id=target_id).delete()
    db.commit()

@router.delete("", status_code=204)
def clear(db: Session = Depends(get_db), user=Depends(get_current_user)):
    db.query(SavedItem).filter_by(user_id=user.id).delete(); db.commit()
