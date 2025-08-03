from fastapi import APIRouter, Query, Depends, status
from typing import List, Optional
from app.services.spotify_service import SpotifyService
from app.dependencies import get_spotify_service
from app.schemas import (
    Track,
    TrackQuery,
    PlaylistCreateRequest,
    MultipleTracksSearchResponse,
    Playlist
)

router = APIRouter()

@router.get("/search", response_model=List[Track])
def search_track(
    track_name: str = Query(..., alias="track"), 
    artist_name: Optional[str] = Query(None, alias="artist"), 
    spotify_service: SpotifyService = Depends(get_spotify_service)
):
    """単一のトラックを名前で検索します。"""
    return spotify_service.search_track(track_name=track_name, artist_name=artist_name)

@router.post("/search/multiple", response_model=MultipleTracksSearchResponse)
async def search_multiple_tracks(queries: List[TrackQuery], spotify_service: SpotifyService = Depends(get_spotify_service)):
    """複数のクエリで並行してトラックを検索します。"""
    found_tracks, not_found_tracks = await spotify_service.search_multiple_tracks(queries)
    return MultipleTracksSearchResponse(found_tracks=found_tracks, not_found_tracks=not_found_tracks)

@router.post("/", response_model=Playlist, status_code=status.HTTP_201_CREATED)
def create_playlist(payload: PlaylistCreateRequest, spotify_service: SpotifyService = Depends(get_spotify_service)):
    """
    新しいSpotifyプレイリストを作成し、指定されたトラックを追加します。
    """
    user_id = spotify_service.get_current_user_id()
    created_playlist = spotify_service.create_playlist_and_add_tracks(
        user_id=user_id,
        name=payload.name,
        public=payload.public,
        description=payload.description,
        track_uris=payload.track_uris
    )

    return Playlist(
        id=created_playlist.get("id"),
        name=created_playlist.get("name"),
        url=created_playlist.get("external_urls", {}).get("spotify"),
        track_count=created_playlist.get("tracks", {}).get("total", len(payload.track_uris))
    )
