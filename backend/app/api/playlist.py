from fastapi import APIRouter, Request, Response, Query
from typing import List, Optional
from app.utils.token_utils import TokenManager
from app.services.spotify_service import SpotifyService
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field

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

class PlaylistCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, description="プレイリスト名")
    description: Optional[str] = Field("", description="プレイリストの説明")
    public: bool = Field(True, description="公開設定（True: 公開, False: 非公開）")
    track_uris: List[str] = Field(..., description="追加するトラックのSpotify URIのリスト。例: [\"spotify:track:4iV5W9uYEdYUVa79Axb7Rh\"]")

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

@router.post("/")
def create_playlist(payload: PlaylistCreateRequest, request: Request, response: Response):
    """
    新しいSpotifyプレイリストを作成し、指定されたトラックを追加します。
    """
    access_token = token_manager.get_valid_access_token(request, response)
    spotify_service = SpotifyService(access_token)

    # 現在のユーザーIDを取得
    user_id = spotify_service.get_current_user_id()

    # プレイリストを作成し、トラックを追加
    created_playlist = spotify_service.create_playlist(
        user_id=user_id,
        name=payload.name,
        public=payload.public,
        description=payload.description,
        track_uris=payload.track_uris
    )

    return created_playlist
