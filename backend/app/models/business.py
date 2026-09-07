from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class BusinessCategory(str, enum.Enum):
    HAIR_BEAUTY = "hair_beauty"
    PHONES_TECH = "phones_tech"
    FOOD_CATERING = "food_catering"
    HOME_SERVICES = "home_services"
    FASHION = "fashion"
    OTHER = "other"

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    category = Column(Enum(BusinessCategory), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    banner_color = Column(String, default="#1e8a4e")
    emoji = Column(String, default="🏪")
    commission_rate = Column(Float, default=0.10)  # 10%
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    approval_status = Column(String(20), nullable=False, default="approved", server_default="approved")
    review_note = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    cover_url = Column(Text, nullable=True)
    opening_hours = Column(Text, nullable=True)
    collection_info = Column(Text, nullable=True)
    delivery_info = Column(Text, nullable=True)
    returns_info = Column(Text, nullable=True)

    services = relationship("Service", back_populates="business", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="business")
    orders = relationship("Order", back_populates="business")
    commissions = relationship("Commission", back_populates="business")
