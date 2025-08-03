from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class TrackQuery(BaseModel):
    """複数トラック検索APIへのリクエストで利用する、個々のクエリを表すモデル"""
    track: str
    artist: Optional[str] = None

class PlaylistCreateRequest(BaseModel):
    """プレイリスト作成APIへのリクエストボディを表すモデル"""
    name: str = Field(..., min_length=1, description="プレイリスト名")
    description: Optional[str] = Field("", description="プレイリストの説明")
    public: bool = Field(True, description="公開設定（True: 公開, False: 非公開）")
    track_uris: List[str] = Field(..., description="追加するトラックのSpotify URIのリスト。例: [\"spotify:track:4iV5W9uYEdYUVa79Axb7Rh\"]")

class Track(BaseModel):
    """Spotifyのトラック情報を表すモデル"""
    name: str
    artist: str
    uri: str

class MultipleTracksSearchResponse(BaseModel):
    """複数トラック検索APIのレスポンスを表すモデル"""
    # spotipyが返す辞書構造をそのまま利用するため、型はdictのリストとする
    found_tracks: List[Dict[str, Any]]
    not_found_tracks: List[TrackQuery]

class Playlist(BaseModel):
    """Spotifyのプレイリスト情報を表すモデル"""
    id: str
    name: str
    url: str
    track_count: int

class UserProfile(BaseModel):
    """Spotifyのユーザープロフィール情報を表すモデル"""
    id: str
    display_name: str
    email: str
    uri: str
    images: List[Dict[str, Any]]