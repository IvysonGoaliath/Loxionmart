from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.service import Service
from app.models.business import Business
from app.schemas.booking import BookingCreate, BookingUpdate, BookingOut
from app.routers.deps import get_current_user, require_admin
from app.services.whatsapp import notify_booking_client, notify_booking_business
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=BookingOut, status_code=201)
def create_booking(data: BookingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    biz = db.query(Business).filter(Business.id == data.business_id, Business.is_active == True).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    service = None
    if data.service_id:
        service = db.query(Service).filter(Service.id == data.service_id).first()

    booking = Booking(
        client_id=user.id,
        business_id=data.business_id,
        service_id=data.service_id,
        notes=data.notes,
        preferred_date=data.preferred_date,
        total_amount=service.price if service else None,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Send WhatsApp notifications
    if user.phone:
        notify_booking_client(user.phone, user.full_name, biz.name, service.name if service else "service")
    if biz.whatsapp_number:
        notify_booking_business(biz.whatsapp_number, user.full_name, user.phone or "N/A", service.name if service else "General enquiry", data.notes or "")

    return booking

@router.get("/my", response_model=List[BookingOut])
def my_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Booking).filter(Booking.client_id == user.id).order_by(Booking.created_at.desc()).all()

@router.get("/", response_model=List[BookingOut])
def all_bookings(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(Booking).order_by(Booking.created_at.desc()).all()

@router.put("/{booking_id}", response_model=BookingOut)
def update_booking(booking_id: int, data: BookingUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(booking, k, v)
    db.commit()
    db.refresh(booking)
    return booking
