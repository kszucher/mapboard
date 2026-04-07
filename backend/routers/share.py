from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Map, Share, User
from ..schemas import CreateShareBody, GetSharesResponse, ShareIdBody

router = APIRouter()


def _owned_map(user: User, map_id: str, db: Session) -> Map:
    map_obj = db.get(Map, map_id)
    if map_obj is None or map_obj.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    return map_obj


def _share_for_owner(user: User, share_id: str, db: Session) -> Share:
    share = db.get(Share, share_id)
    if share is None or share.owner_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share not found")
    return share


def _share_for_recipient(user: User, share_id: str, db: Session) -> Share:
    share = db.get(Share, share_id)
    if share is None or share.share_user_email != user.email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share not found")
    return share


@router.post("/get-shares", response_model=GetSharesResponse)
def get_shares(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incoming = (
        db.query(Share)
        .join(Map, Share.map_id == Map.id)
        .join(User, Share.owner_user_id == User.id)
        .filter(Share.share_user_email == user.email)
        .order_by(Map.name)
        .all()
    )
    outgoing = (
        db.query(Share)
        .join(Map, Share.map_id == Map.id)
        .filter(Share.owner_user_id == user.id)
        .order_by(Map.name)
        .all()
    )
    return GetSharesResponse(
        shareDataImport=[
            {
                "_id": share.id,
                "sharedMapName": share.map.name,
                "ownerUserEmail": share.owner.email,
                "access": share.access,
                "status": share.status,
            }
            for share in incoming
        ],
        shareDataExport=[
            {
                "_id": share.id,
                "sharedMapName": share.map.name,
                "shareUserEmail": share.share_user_email,
                "access": share.access,
                "status": share.status,
            }
            for share in outgoing
        ],
    )


@router.post("/create-share", status_code=status.HTTP_204_NO_CONTENT)
def create_share(
    body: CreateShareBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    map_obj = _owned_map(user, body.mapId, db)
    existing = (
        db.query(Share)
        .filter(Share.map_id == map_obj.id, Share.share_user_email == body.shareEmail)
        .first()
    )
    if existing:
        existing.access = body.shareAccess
        existing.status = "waiting"
    else:
        db.add(
            Share(
                map_id=map_obj.id,
                owner_user_id=user.id,
                share_user_email=body.shareEmail,
                access=body.shareAccess,
                status="waiting",
            )
        )
    db.commit()


@router.post("/update-share-access", status_code=status.HTTP_204_NO_CONTENT)
def update_share_access(
    body: ShareIdBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    share = _share_for_owner(user, body.shareId, db)
    share.access = "edit" if share.access == "view" else "view"
    db.commit()


@router.post("/update-share-status-accepted", status_code=status.HTTP_204_NO_CONTENT)
def update_share_status_accepted(
    body: ShareIdBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    share = _share_for_recipient(user, body.shareId, db)
    share.status = "accepted"
    db.commit()


@router.post("/withdraw-share", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_share(
    body: ShareIdBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    share = _share_for_owner(user, body.shareId, db)
    db.delete(share)
    db.commit()


@router.post("/reject-share", status_code=status.HTTP_204_NO_CONTENT)
def reject_share(
    body: ShareIdBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    share = _share_for_recipient(user, body.shareId, db)
    db.delete(share)
    db.commit()
