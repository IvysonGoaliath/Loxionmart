from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class ServiceType(str, enum.Enum):
    BOOKING = "booking"    # Hair, plumbing etc - time-based
    PRODUCT = "product"    # Phones, food etc - buy now

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    emoji = Column(String, default="🛍️")
    service_type = Column(Enum(ServiceType), default=ServiceType.BOOKING)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="services")
    order_items = relationship("OrderItem", back_populates="service")
