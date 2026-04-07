from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class SignInResponse(BaseModel):
    connectionId: str


class OpenWorkspaceResponse(BaseModel):
    userName: str
    colorMode: str
    isShared: bool
    access: str
    tabMapIdList: list[str]
    tabMapNameList: list[str]
    tabId: int
    sharedMapIdList: list[str]
    sharedMapNameList: list[str]
    breadcrumbMapIdList: list[str]
    breadcrumbMapNameList: list[str]
    mapId: str
    mapName: str
    mapData: dict[str, Any]
    mapMergeId: str


class GetLatestMergedResponse(BaseModel):
    mapData: dict[str, Any]
    mapMergeId: str


class ShareListItemImport(BaseModel):
    _id: str
    sharedMapName: str
    ownerUserEmail: str
    access: str
    status: str


class ShareListItemExport(BaseModel):
    _id: str
    sharedMapName: str
    shareUserEmail: str
    access: str
    status: str


class GetSharesResponse(BaseModel):
    shareDataImport: list[ShareListItemImport]
    shareDataExport: list[ShareListItemExport]


class IngestionResponse(BaseModel):
    ingestionResult: str | list[Any]


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


class CreateShareBody(BaseModel):
    mapId: str
    shareEmail: str
    shareAccess: str


class ShareIdBody(BaseModel):
    shareId: str
