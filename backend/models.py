from __future__ import annotations

import uuid

from sqlalchemy import JSON, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    color_mode: Mapped[str] = mapped_column(String, nullable=False, default="dark")
    active_map_id: Mapped[str | None] = mapped_column(String, ForeignKey("maps.id"), nullable=True)

    active_map: Mapped["Map | None"] = relationship(foreign_keys=[active_map_id], post_update=True)


class Map(Base):
    __tablename__ = "maps"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False, default="Untitled")
    map_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    tab_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    parent_map_id: Mapped[str | None] = mapped_column(String, ForeignKey("maps.id"), nullable=True)
    parent_node_id: Mapped[str | None] = mapped_column(String, nullable=True)
    last_merge_id: Mapped[str] = mapped_column(String, nullable=False, default=_uuid)

    parent_map: Mapped["Map | None"] = relationship(remote_side=[id], foreign_keys=[parent_map_id])
