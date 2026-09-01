from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class CommissionStatus(str, enum.Enum):
    PENDING = "pending"
    PAID_OUT = "paid_out"

class Commission(Base):
    __tablename__ = "commissions"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    amount = Column(Float, nullable=False)
    rate = Column(Float, nullable=False)
    status = Column(Enum(CommissionStatus), default=CommissionStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_out_at = Column(DateTime, nullable=True)

    business = relationship("Business", back_populates="commissions")
    order = relationship("Order", back_populates="commission")
