from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_user
from app.schemas.user import UserOut
from app.models.user import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["users"])

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user

@router.put("/me", response_model=UserOut)
def update_me(data: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.full_name: user.full_name = data.full_name
    if data.phone is not None: user.phone = data.phone
    db.commit()
    db.refresh(user)
    return user
