from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import file, map, share, user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mapboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(local\.mapboard|localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(map.router)
app.include_router(share.router)
app.include_router(file.router)


@app.get("/")
def health():
    return {"status": "ok"}
