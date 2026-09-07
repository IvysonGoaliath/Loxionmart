import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, Response
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.mall import MediaAsset
from app.models.business import Business
from app.models.user import UserRole
from app.routers.deps import get_current_user

router = APIRouter(prefix="/media", tags=["media"])
MAX_BYTES = 2 * 1024 * 1024

@router.post("", status_code=201)
async def upload(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != UserRole.ADMIN and not db.query(Business).filter(Business.owner_id==user.id).first():
        raise HTTPException(403,"Apply for your shop before uploading catalogue photos")
    if int(request.headers.get("content-length", "0"))>MAX_BYTES+65536: raise HTTPException(413,"Choose an image smaller than 2 MB")
    data = await file.read(MAX_BYTES+1)
    await file.close()
    if len(data)>MAX_BYTES: raise HTTPException(413,"Choose an image smaller than 2 MB")
    if data.startswith(b"\xff\xd8\xff"): mime="image/jpeg"
    elif data.startswith(b"\x89PNG\r\n\x1a\n"): mime="image/png"
    elif data[:4]==b"RIFF" and data[8:12]==b"WEBP": mime="image/webp"
    else: raise HTTPException(422,"Upload a JPG, PNG or WebP image")
    used = db.query(func.coalesce(func.sum(MediaAsset.byte_size),0)).filter(MediaAsset.owner_id==user.id).scalar()
    if used+len(data)>20*1024*1024: raise HTTPException(400,"Your photo allowance is full. Contact the mall administrator.")
    asset = MediaAsset(id=str(uuid.uuid4()),owner_id=user.id,content_type=mime,byte_size=len(data),data=data)
    db.add(asset); db.commit()
    return {"url":f"/api/media/{asset.id}"}

@router.get("/{asset_id}")
def read(asset_id: str, db: Session = Depends(get_db)):
    asset = db.get(MediaAsset, asset_id)
    if not asset: raise HTTPException(404,"Image not found")
    return Response(content=asset.data,media_type=asset.content_type,headers={"Cache-Control":"public, max-age=31536000, immutable", "X-Content-Type-Options":"nosniff", "Content-Security-Policy":"default-src 'none'"})
