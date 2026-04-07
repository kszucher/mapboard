from __future__ import annotations

import uuid

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    auth0_sub: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False, default="")
    color_mode: Mapped[str] = mapped_column(String, nullable=False, default="dark")
    connection_id: Mapped[str] = mapped_column(String, unique=True, nullable=False, default=_uuid)
    active_map_id: Mapped[str | None] = mapped_column(String, ForeignKey("maps.id"), nullable=True)

    maps: Mapped[list["Map"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
        foreign_keys="Map.owner_id",
    )
    active_map: Mapped["Map | None"] = relationship(foreign_keys=[active_map_id], post_update=True)
    shares_sent: Mapped[list["Share"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
        foreign_keys="Share.owner_user_id",
    )
    ingestions: Mapped[list["Ingestion"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Ingestion.user_id",
    )


class Map(Base):
    __tablename__ = "maps"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False, default="Untitled")
    owner_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    map_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    tab_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    parent_map_id: Mapped[str | None] = mapped_column(String, ForeignKey("maps.id"), nullable=True)
    parent_node_id: Mapped[str | None] = mapped_column(String, nullable=True)
    last_merge_id: Mapped[str] = mapped_column(String, nullable=False, default=_uuid)

    owner: Mapped[User] = relationship(back_populates="maps", foreign_keys=[owner_id])
    parent_map: Mapped["Map | None"] = relationship(remote_side=[id], foreign_keys=[parent_map_id])
    shares: Mapped[list["Share"]] = relationship(
        back_populates="map",
        cascade="all, delete-orphan",
        foreign_keys="Share.map_id",
    )


class Share(Base):
    __tablename__ = "shares"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    map_id: Mapped[str] = mapped_column(String, ForeignKey("maps.id"), nullable=False, index=True)
    owner_user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    share_user_email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    access: Mapped[str] = mapped_column(String, nullable=False, default="view")
    status: Mapped[str] = mapped_column(String, nullable=False, default="waiting")

    map: Mapped[Map] = relationship(back_populates="shares", foreign_keys=[map_id])
    owner: Mapped[User] = relationship(back_populates="shares_sent", foreign_keys=[owner_user_id])


class Ingestion(Base):
    __tablename__ = "ingestions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    content_type: Mapped[str] = mapped_column(String, nullable=False, default="")
    result: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_latest: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    user: Mapped[User] = relationship(back_populates="ingestions", foreign_keys=[user_id])
