from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import User
from ..schemas import SignInResponse

router = APIRouter()


@router.post("/sign-in", response_model=SignInResponse)
def sign_in(user: User = Depends(get_current_user)):
    return SignInResponse(connectionId=user.connection_id)


@router.post("/sign-out-everywhere", status_code=status.HTTP_204_NO_CONTENT)
def sign_out_everywhere():
    return None


@router.post("/toggle-color-mode", status_code=status.HTTP_204_NO_CONTENT)
def toggle_color_mode(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.color_mode = "light" if user.color_mode == "dark" else "dark"
    db.commit()


@router.post("/delete-account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.delete(user)
    db.commit()
