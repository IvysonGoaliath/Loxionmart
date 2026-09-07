from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, Enum, JSON
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

    image_urls = Column(JSON, nullable=False, default=list, server_default="[]")
    specifications = Column(JSON, nullable=False, default=dict, server_default="{}")
    stock_quantity = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)

    business = relationship("Business", back_populates="services")
    order_items = relationship("OrderItem", back_populates="service")
