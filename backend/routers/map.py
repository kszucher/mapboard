from __future__ import annotations

import copy
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Map, Workspace
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
        r_id: {"path": ["r", 0], "offsetW": 10, "offsetH": 10, "selected": 1, "controlType": "", "note": ""},
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


def _workspace(db: Session) -> Workspace:
    workspace = db.get(Workspace, 1)
    if workspace is None:
      workspace = Workspace(id=1)
      db.add(workspace)
      db.commit()
      db.refresh(workspace)
    return workspace


def _maps(db: Session) -> list[Map]:
    return db.query(Map).order_by(Map.tab_order, Map.name).all()


def _reorder(maps: list[Map]) -> None:
    for index, item in enumerate(maps):
        item.tab_order = index


def _ensure_default_map(db: Session) -> Map:
    maps = _maps(db)
    if maps:
        return maps[0]
    map_obj = Map(name="Untitled", map_data=_default_map_data(), tab_order=0)
    db.add(map_obj)
    db.commit()
    db.refresh(map_obj)
    return map_obj


def _active_map(db: Session) -> tuple[Workspace, Map]:
    workspace = _workspace(db)
    if workspace.active_map_id:
        active = db.get(Map, workspace.active_map_id)
        if active is not None:
            return workspace, active
    active = _ensure_default_map(db)
    workspace.active_map_id = active.id
    db.commit()
    return workspace, active


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


@router.post("/open-workspace", response_model=OpenWorkspaceResponse)
def open_workspace(db: Session = Depends(get_db)):
    workspace, active_map = _active_map(db)
    maps = _maps(db)
    breadcrumbs = _breadcrumb_chain(active_map, db)
    return OpenWorkspaceResponse(
        colorMode=workspace.color_mode,
        tabMapIdList=[item.id for item in maps],
        tabMapNameList=[item.name for item in maps],
        tabId=next((index for index, item in enumerate(maps) if item.id == active_map.id), 0),
        breadcrumbMapIdList=[item.id for item in breadcrumbs],
        breadcrumbMapNameList=[item.name for item in breadcrumbs],
        mapId=active_map.id,
        mapName=active_map.name,
        mapData=active_map.map_data or _default_map_data(),
        mapMergeId=active_map.last_merge_id,
    )


@router.post("/get-latest-merged", response_model=GetLatestMergedResponse)
def get_latest_merged(db: Session = Depends(get_db)):
    _, active_map = _active_map(db)
    return GetLatestMergedResponse(mapData=active_map.map_data or _default_map_data(), mapMergeId=active_map.last_merge_id)


@router.post("/toggle-color-mode", status_code=status.HTTP_204_NO_CONTENT)
def toggle_color_mode(db: Session = Depends(get_db)):
    workspace = _workspace(db)
    workspace.color_mode = "light" if workspace.color_mode == "dark" else "dark"
    db.commit()


@router.post("/select-map", status_code=status.HTTP_204_NO_CONTENT)
def select_map(body: SelectMapBody, db: Session = Depends(get_db)):
    map_obj = db.get(Map, body.mapId)
    if map_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    workspace = _workspace(db)
    workspace.active_map_id = map_obj.id
    db.commit()


@router.post("/rename-map", status_code=status.HTTP_204_NO_CONTENT)
def rename_map(body: RenameMapBody, db: Session = Depends(get_db)):
    map_obj = db.get(Map, body.mapId)
    if map_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    map_obj.name = body.name or "Untitled"
    db.commit()


@router.post("/create-map-in-map", status_code=status.HTTP_204_NO_CONTENT)
def create_map_in_map(body: CreateMapInMapBody, db: Session = Depends(get_db)):
    parent_map = db.get(Map, body.mapId)
    if parent_map is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    child_map = Map(
        name=body.content or "Untitled",
        parent_map_id=parent_map.id,
        parent_node_id=body.nodeId,
        map_data=_default_map_data(),
        tab_order=len(_maps(db)),
    )
    db.add(child_map)
    db.flush()
    map_data = copy.deepcopy(parent_map.map_data or {})
    if body.nodeId in map_data and isinstance(map_data[body.nodeId], dict):
        map_data[body.nodeId]["linkType"] = "internal"
        map_data[body.nodeId]["link"] = child_map.id
        parent_map.map_data = map_data
        parent_map.last_merge_id = str(uuid.uuid4())
    workspace = _workspace(db)
    workspace.active_map_id = child_map.id
    db.commit()


@router.post("/create-map-in-tab", status_code=status.HTTP_204_NO_CONTENT)
def create_map_in_tab(db: Session = Depends(get_db)):
    map_obj = Map(name="Untitled", tab_order=len(_maps(db)), map_data=_default_map_data())
    db.add(map_obj)
    db.flush()
    workspace = _workspace(db)
    workspace.active_map_id = map_obj.id
    db.commit()


@router.post("/create-map-in-tab-duplicate", status_code=status.HTTP_204_NO_CONTENT)
def create_map_in_tab_duplicate(body: DuplicateMapBody, db: Session = Depends(get_db)):
    source_map = db.get(Map, body.mapId)
    if source_map is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    duplicate = Map(
        name=f"{source_map.name} (copy)",
        tab_order=len(_maps(db)),
        map_data=copy.deepcopy(source_map.map_data or _default_map_data()),
    )
    db.add(duplicate)
    db.flush()
    workspace = _workspace(db)
    workspace.active_map_id = duplicate.id
    db.commit()


@router.post("/move-up-map-in-tab", status_code=status.HTTP_204_NO_CONTENT)
def move_up_map_in_tab(body: MoveMapBody, db: Session = Depends(get_db)):
    maps = _maps(db)
    index = next((idx for idx, item in enumerate(maps) if item.id == body.mapId), None)
    if index is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    if index > 0:
        maps[index - 1], maps[index] = maps[index], maps[index - 1]
        _reorder(maps)
        db.commit()


@router.post("/move-down-map-in-tab", status_code=status.HTTP_204_NO_CONTENT)
def move_down_map_in_tab(body: MoveMapBody, db: Session = Depends(get_db)):
    maps = _maps(db)
    index = next((idx for idx, item in enumerate(maps) if item.id == body.mapId), None)
    if index is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    if index < len(maps) - 1:
        maps[index], maps[index + 1] = maps[index + 1], maps[index]
        _reorder(maps)
        db.commit()


@router.post("/save-map", status_code=status.HTTP_204_NO_CONTENT)
def save_map(body: SaveMapBody, db: Session = Depends(get_db)):
    map_obj = db.get(Map, body.mapId)
    if map_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    map_obj.map_data = _merge_map_data(map_obj.map_data, body.mapDelta)
    map_obj.last_merge_id = str(uuid.uuid4())
    db.commit()


@router.post("/delete-map", status_code=status.HTTP_204_NO_CONTENT)
def delete_map(body: MapIdBody, db: Session = Depends(get_db)):
    map_obj = db.get(Map, body.mapId)
    if map_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map not found")
    for child in db.query(Map).filter(Map.parent_map_id == map_obj.id).all():
        child.parent_map_id = None
    workspace = _workspace(db)
    if workspace.active_map_id == map_obj.id:
        workspace.active_map_id = None
    db.delete(map_obj)
    db.commit()
