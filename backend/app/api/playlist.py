from fastapi import APIRouter, Request, Response, Query
from typing import List, Optional
from app.utils.token_utils import TokenManager
from app.services.spotify_service import SpotifyService
import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(verbose=True)

router = APIRouter()

token_manager = TokenManager(
    client_id=os.environ.get("SPOTIPY_CLIENT_ID"),
    client_secret=os.environ.get("SPOTIPY_CLIENT_SECRET"),
    redirect_uri=os.environ.get("SPOTIPY_REDIRECT_URI"),
    scope="playlist-modify-public playlist-modify-private"
) 

class TrackQuery(BaseModel):
    track: str
    artist: Optional[str] = None

@router.get("/search")
def search_track(track_name: str = Query(..., alias="track"), artist_name: Optional[str] = Query(None, alias="artist"), request: Request=None, response: Response=None):
    access_token = token_manager.get_valid_access_token(request, response)
    spotify_service = SpotifyService(access_token)
    return spotify_service.search_track(track_name=track_name, artist_name=artist_name)

@router.post("/search/multiple")
async def search_multiple_tracks(queries: List[TrackQuery], request: Request, response: Response):
    access_token = token_manager.get_valid_access_token(request, response)
    spotify_service = SpotifyService(access_token)

    # Pydanticモデルを辞書のリストに変換
    query_dicts = [q.dict(exclude_none=True) for q in queries]

    found_tracks, not_found_tracks = await spotify_service.search_multiple_tracks(query_dicts)
    return {"found_tracks": found_tracks, "not_found_tracks": not_found_tracks}