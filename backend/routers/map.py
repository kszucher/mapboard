from __future__ import annotations

import copy
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Map, Share, User
from ..schemas import (
    CreateMapInMapBody,
    DuplicateMapBody,
    GetLatestMergedResponse,
    MapIdBody,
    MoveMapBody,
    OpenWorkspaceResponse,
    RenameMapBody,
    SaveMapBody,
    SelectMapBody,
)

router = APIRouter()


def _default_map_data() -> dict[str, dict]:
    g_id = str(uuid.uuid4())
    r_id = str(uuid.uuid4())
    s_id = str(uuid.uuid4())
    return {
        g_id: {"path": ["g"]},
        r_id: {
            "path": ["r", 0],
            "offsetW": 10,
            "offsetH": 10,
            "selected": 1,
            "controlType": "",
            "note": "",
        },
        s_id: {
            "path": ["r", 0, "s", 0],
            "contentType": "text",
            "content": "Untitled",
            "selected": 1,
            "selection": "s",
            "lineWidth": 1,
            "lineType": 0,
            "lineColor": "#bbbbbb",
            "textFontSize": 14,
            "textColor": "default",
            "linkType": "",
            "link": "",
        },
    }


def _reorder(maps: list[Map]) -> None:
    for index, item in enumerate(maps):
        item.tab_order = index


def _accepted_share_for_map(user: User, map_id: str, db: Session) -> Share | None:
    return (
        db.query(Share)
        .filter(
            Share.map_id == map_id,
            Share.share_user_email == user.email,
            Share.status == "accepted",
        )
        .first()
    )


def _can_access_map(user: User, map_id: str, db: Session) -> tuple[Map, str, bool]:
    map_obj = db.get(Map, map_id)
    if map_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    if map_obj.owner_id == user.id:
        return map_obj, "edit", False

    share = _accepted_share_for_map(user, map_id, db)
    if share is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    return map_obj, share.access, True


def _owned_maps(user: User, db: Session) -> list[Map]:
    return db.query(Map).filter(Map.owner_id == user.id).order_by(Map.tab_order, Map.name).all()


def _shared_maps(user: User, db: Session) -> list[Map]:
    return (
        db.query(Map)
        .join(Share, Share.map_id == Map.id)
        .filter(Share.share_user_email == user.email, Share.status == "accepted")
        .order_by(Map.name)
        .all()
    )


def _ensure_default_owned_map(user: User, db: Session) -> Map:
    existing = _owned_maps(user, db)
    if existing:
        return existing[0]

    new_map = Map(
        owner_id=user.id,
        name="Untitled",
        map_data=_default_map_data(),
        tab_order=0,
    )
    db.add(new_map)
    db.flush()
    user.active_map_id = new_map.id
    db.commit()
    db.refresh(new_map)
    return new_map


def _resolve_active_map(user: User, db: Session) -> tuple[Map, str, bool]:
    if user.active_map_id:
        try:
            return _can_access_map(user, user.active_map_id, db)
        except HTTPException:
            user.active_map_id = None
            db.commit()

    first_owned = _ensure_default_owned_map(user, db)
    user.active_map_id = first_owned.id
    db.commit()
    return first_owned, "edit", False


def _merge_map_data(current: dict | None, delta: dict | None) -> dict:
    merged = copy.deepcopy(current or {})
    for node_id, patch in (delta or {}).items():
        if patch is None:
            merged.pop(node_id, None)
            continue
        if isinstance(patch, dict) and isinstance(merged.get(node_id), dict):
            next_node = copy.deepcopy(merged[node_id])
            for key, value in patch.items():
                if value is None:
                    next_node.pop(key, None)
                else:
                    next_node[key] = value
            merged[node_id] = next_node
        else:
            merged[node_id] = patch
    return merged


def _breadcrumb_chain(map_obj: Map, db: Session) -> list[Map]:
    chain: list[Map] = []
    current = map_obj
    while current is not None:
        chain.append(current)
        current = db.get(Map, current.parent_map_id) if current.parent_map_id else None
    chain.reverse()
    return chain


def _open_workspace_payload(user: User, db: Session) -> OpenWorkspaceResponse:
    active_map, access, is_shared = _resolve_active_map(user, db)
    owned_maps = _owned_maps(user, db)
    shared_maps = _shared_maps(user, db)
    breadcrumb_maps = _breadcrumb_chain(active_map, db)
    tab_ids = [item.id for item in owned_maps]
    tab_names = [item.name for item in owned_maps]
    shared_ids = [item.id for item in shared_maps]
    shared_names = [item.name for item in shared_maps]
    tab_id = next((index for index, item in enumerate(owned_maps) if item.id == active_map.id), 0)
    return OpenWorkspaceResponse(
        userName=user.name or user.email,
        colorMode=user.color_mode,
        isShared=is_shared,
        access=access,
        tabMapIdList=tab_ids,
        tabMapNameList=tab_names,
        tabId=tab_id,
        sharedMapIdList=shared_ids,
        sharedMapNameList=shared_names,
        breadcrumbMapIdList=[item.id for item in breadcrumb_maps],
        breadcrumbMapNameList=[item.name for item in breadcrumb_maps],
        mapId=active_map.id,
        mapName=active_map.name,
        mapData=active_map.map_data or _default_map_data(),
        mapMergeId=active_map.last_merge_id,
    )


def _assert_can_edit(user: User, map_obj: Map, db: Session) -> None:
    if map_obj.owner_id == user.id:
        return
    share = _accepted_share_for_map(user, map_obj.id, db)
    if share and share.access == "edit":
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Map is read-only")


@router.post("/open-workspace", response_model=OpenWorkspaceResponse)
def open_workspace(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _open_workspace_payload(user, db)


@router.post("/get-latest-merged", response_model=GetLatestMergedResponse)
def get_latest_merged(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    active_map, _, _ = _resolve_active_map(user, db)
    return GetLatestMergedResponse(
        mapData=active_map.map_data or _default_map_data(),
        mapMergeId=active_map.last_merge_id,
    )


@router.post("/select-map", status_code=status.HTTP_204_NO_CONTENT)
def select_map(
    body: SelectMapBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    map_obj, _, _ = _can_access_map(user, body.mapId, db)
    user.active_map_id = map_obj.id
    db.commit()


@router.post("/rename-map", status_code=status.HTTP_204_NO_CONTENT)
def rename_map(
    body: RenameMapBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    map_obj, _, _ = _can_access_map(user, body.mapId, db)
    _assert_can_edit(user, map_obj, db)
    map_obj.name = body.name or "Untitled"
    db.commit()


@router.post("/create-map-in-map", status_code=status.HTTP_204_NO_CONTENT)
def create_map_in_map(
    body: CreateMapInMapBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    parent_map, _, _ = _can_access_map(user, body.mapId, db)
    _assert_can_edit(user, parent_map, db)

    child_map = Map(
        owner_id=user.id,
        name=body.content or "Untitled",
        parent_map_id=parent_map.id,
        parent_node_id=body.nodeId,
        map_data=_default_map_data(),
        tab_order=len(_owned_maps(user, db)),
    )
    db.add(child_map)
    db.flush()

    map_data = copy.deepcopy(parent_map.map_data or {})
    if body.nodeId in map_data and isinstance(map_data[body.nodeId], dict):
        map_data[body.nodeId]["linkType"] = "internal"
        map_data[body.nodeId]["link"] = child_map.id
        parent_map.map_data = map_data
        parent_map.last_merge_id = str(uuid.uuid4())

    user.active_map_id = child_map.id
    db.commit()


@router.post("/create-map-in-tab", status_code=status.HTTP_204_NO_CONTENT)
def create_map_in_tab(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_map = Map(
        owner_id=user.id,
        name="Untitled",
        tab_order=len(_owned_maps(user, db)),
        map_data=_default_map_data(),
    )
    db.add(new_map)
    db.flush()
    user.active_map_id = new_map.id
    db.commit()


@router.post("/create-map-in-tab-duplicate", status_code=status.HTTP_204_NO_CONTENT)
def create_map_in_tab_duplicate(
    body: DuplicateMapBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    source_map, _, _ = _can_access_map(user, body.mapId, db)
    duplicate = Map(
        owner_id=user.id,
        name=f"{source_map.name} (copy)",
        tab_order=len(_owned_maps(user, db)),
        map_data=copy.deepcopy(source_map.map_data or _default_map_data()),
    )
    db.add(duplicate)
    db.flush()
    user.active_map_id = duplicate.id
    db.commit()


@router.post("/move-up-map-in-tab", status_code=status.HTTP_204_NO_CONTENT)
def move_up_map_in_tab(
    body: MoveMapBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    maps = _owned_maps(user, db)
    index = next((idx for idx, item in enumerate(maps) if item.id == body.mapId), None)
    if index is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    if index > 0:
        maps[index - 1], maps[index] = maps[index], maps[index - 1]
        _reorder(maps)
        db.commit()


@router.post("/move-down-map-in-tab", status_code=status.HTTP_204_NO_CONTENT)
def move_down_map_in_tab(
    body: MoveMapBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    maps = _owned_maps(user, db)
    index = next((idx for idx, item in enumerate(maps) if item.id == body.mapId), None)
    if index is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    if index < len(maps) - 1:
        maps[index], maps[index + 1] = maps[index + 1], maps[index]
        _reorder(maps)
        db.commit()


@router.post("/save-map", status_code=status.HTTP_204_NO_CONTENT)
def save_map(
    body: SaveMapBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    map_obj, _, _ = _can_access_map(user, body.mapId, db)
    _assert_can_edit(user, map_obj, db)
    map_obj.map_data = _merge_map_data(map_obj.map_data, body.mapDelta)
    map_obj.last_merge_id = str(uuid.uuid4())
    db.commit()


@router.post("/delete-map", status_code=status.HTTP_204_NO_CONTENT)
def delete_map(
    body: MapIdBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    map_obj = db.get(Map, body.mapId)
    if map_obj is None or map_obj.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")

    for child in db.query(Map).filter(Map.parent_map_id == map_obj.id).all():
        child.parent_map_id = None

    if user.active_map_id == map_obj.id:
        user.active_map_id = None
    db.delete(map_obj)
    db.commit()
