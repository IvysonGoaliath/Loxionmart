from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.service import Service
from app.models.business import Business
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut
from app.routers.deps import require_admin

router = APIRouter(prefix="/businesses/{business_id}/services", tags=["services"])

@router.get("/", response_model=List[ServiceOut])
def list_services(business_id: int, db: Session = Depends(get_db)):
    shop = db.query(Business).filter(Business.id==business_id, Business.is_active.is_(True), Business.approval_status=="approved").first()
    if not shop: raise HTTPException(404,"Business not found")
    return db.query(Service).filter(
        Service.business_id == business_id,
        Service.is_available == True
    ).all()

@router.post("/", response_model=ServiceOut, status_code=201)
def create_service(business_id: int, data: ServiceCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    if not db.get(Business, business_id): raise HTTPException(404,"Business not found")
    service = Service(**data.model_dump(), business_id=business_id)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.put("/{service_id}", response_model=ServiceOut)
def update_service(business_id: int, service_id: int, data: ServiceUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    svc = db.query(Service).filter(Service.id == service_id, Service.business_id == business_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    for k, v in data.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(svc, k, v)
    db.commit()
    db.refresh(svc)
    return svc

@router.delete("/{service_id}", status_code=204)
def delete_service(business_id: int, service_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    svc = db.query(Service).filter(Service.id == service_id, Service.business_id == business_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    svc.is_available = False
    db.commit()
