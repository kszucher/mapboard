from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Ingestion, User
from ..schemas import IngestionResponse

router = APIRouter()


def _extract_text(file_name: str, content_type: str, data: bytes) -> str:
    if content_type.startswith("text/") or file_name.lower().endswith((".txt", ".md", ".csv", ".json")):
        for encoding in ("utf-8", "utf-8-sig", "latin-1"):
            try:
                return data.decode(encoding)
            except UnicodeDecodeError:
                continue
    return (
        f"Uploaded '{file_name}' ({content_type or 'application/octet-stream'}) with "
        f"{len(data)} bytes. Automatic extraction is only implemented for text-like files."
    )


@router.post("/upload-file", status_code=status.HTTP_204_NO_CONTENT)
async def upload_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for row in db.query(Ingestion).filter(Ingestion.user_id == user.id, Ingestion.is_latest.is_(True)).all():
        row.is_latest = False

    data = await file.read()
    result = _extract_text(file.filename or "upload", file.content_type or "", data)
    db.add(
        Ingestion(
            user_id=user.id,
            filename=file.filename or "upload",
            content_type=file.content_type or "",
            result=result,
            is_latest=True,
        )
    )
    db.commit()


@router.post("/get-ingestion", response_model=IngestionResponse)
def get_ingestion(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    latest = (
        db.query(Ingestion)
        .filter(Ingestion.user_id == user.id, Ingestion.is_latest.is_(True))
        .order_by(Ingestion.filename)
        .first()
    )
    return IngestionResponse(ingestionResult=latest.result if latest else "")
