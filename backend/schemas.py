from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class OpenWorkspaceResponse(BaseModel):
    colorMode: str
    tabMapIdList: list[str]
    tabMapNameList: list[str]
    tabId: int
    breadcrumbMapIdList: list[str]
    breadcrumbMapNameList: list[str]
    mapId: str
    mapName: str
    mapData: dict[str, Any]
    mapMergeId: str


class GetLatestMergedResponse(BaseModel):
    mapData: dict[str, Any]
    mapMergeId: str


class SelectMapBody(BaseModel):
    mapId: str


class RenameMapBody(BaseModel):
    mapId: str
    name: str


class CreateMapInMapBody(BaseModel):
    mapId: str
    nodeId: str
    content: str


class DuplicateMapBody(BaseModel):
    mapId: str


class MoveMapBody(BaseModel):
    mapId: str


class MapIdBody(BaseModel):
    mapId: str


class SaveMapBody(BaseModel):
    mapId: str
    mapDelta: dict[str, Any] = Field(default_factory=dict)
