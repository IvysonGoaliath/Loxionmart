from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, LargeBinary, UniqueConstraint
from app.core.database import Base

class SavedItem(Base):
    __tablename__ = "saved_items"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String(10), nullable=False)
    target_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "kind", "target_id", name="uq_saved_target"),)

class MediaAsset(Base):
    __tablename__ = "media_assets"
    id = Column(String(36), primary_key=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content_type = Column(String(30), nullable=False)
    byte_size = Column(Integer, nullable=False)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
