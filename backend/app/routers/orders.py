from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.service import Service
from app.models.business import Business
from app.models.commission import Commission
from app.schemas.order import OrderCreate, OrderOut
from app.routers.deps import get_current_user, require_admin
from app.services.ozow import create_payment, verify_ozow_notification
from app.services.whatsapp import notify_order_paid
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(data: OrderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    biz = db.query(Business).filter(Business.id == data.business_id, Business.is_active == True).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    items = []
    subtotal = 0.0
    for cart_item in data.items:
        svc = db.query(Service).filter(Service.id == cart_item.service_id, Service.business_id == data.business_id).first()
        if not svc:
            raise HTTPException(status_code=404, detail=f"Service {cart_item.service_id} not found")
        total = svc.price * cart_item.quantity
        subtotal += total
        items.append(OrderItem(service_id=svc.id, quantity=cart_item.quantity, unit_price=svc.price, total_price=total))

    commission = subtotal * biz.commission_rate
    total_amount = subtotal

    order = Order(
        client_id=user.id,
        business_id=data.business_id,
        subtotal=subtotal,
        commission_amount=commission,
        total_amount=total_amount,
        notes=data.notes,
    )
    db.add(order)
    db.flush()
    for item in items:
        item.order_id = order.id
        db.add(item)
    db.commit()
    db.refresh(order)

    # Create Ozow payment
    try:
        payment = await create_payment(order.id, total_amount, user.email, f"Loxion Mart Order #{order.id}")
        order.ozow_payment_url = payment["paymentUrl"]
        order.ozow_transaction_id = payment.get("transactionId")
        db.commit()
        db.refresh(order)
    except Exception:
        pass  # Payment URL generation failed — client will retry

    return order

@router.get("/my", response_model=List[OrderOut])
def my_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Order).filter(Order.client_id == user.id).order_by(Order.created_at.desc()).all()

@router.get("/", response_model=List[OrderOut])
def all_orders(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.post("/ozow/notify")
async def ozow_notify(request: Request, db: Session = Depends(get_db)):
    data = dict(await request.form())
    if not verify_ozow_notification(data):
        raise HTTPException(status_code=400, detail="Invalid notification")

    order_id = int(data.get("Optional1", 0))
    status = data.get("Status", "").lower()
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"ok": True}

    if status == "complete":
        order.status = OrderStatus.PAID
        order.paid_at = datetime.utcnow()
        # Record commission
        comm = Commission(business_id=order.business_id, order_id=order.id, amount=order.commission_amount, rate=order.business.commission_rate)
        db.add(comm)
        db.commit()
        # WhatsApp notify
        if order.client.phone:
            notify_order_paid(order.client.phone, order.client.full_name, order.business.name, order.id, order.total_amount)
    elif status in ("cancelled", "error"):
        order.status = OrderStatus.CANCELLED
        db.commit()

    return {"ok": True}
