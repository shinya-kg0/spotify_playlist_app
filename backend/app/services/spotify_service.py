import spotipy
from typing import List, Optional, Dict, Any
import asyncio
from app.schemas import Track, TrackQuery

class SpotifyService:
    def __init__(self, access_token: str):
        self.sp = spotipy.Spotify(auth=access_token)

    def get_current_user_id(self) -> str:
        """
        現在の認証済みユーザーのIDを取得します。
        """
        return self.sp.current_user()["id"]

    def create_playlist_and_add_tracks(self, user_id: str, name: str, public: bool, description: str, track_uris: List[str]) -> Dict[str, Any]:
        """
        新しいプレイリストを作成し、指定されたトラックを追加します。
        """
        # 新しいプレイリストを作成
        playlist = self.sp.user_playlist_create(
            user=user_id,
            name=name,
            public=public,
            description=description
        )

        playlist_id = playlist["id"]

        # トラックURIが提供されていれば、新しいプレイリストに追加
        if track_uris:
            # Spotify APIは一度に100曲までしか追加できないため、100件ずつに分割してリクエスト
            for i in range(0, len(track_uris), 100):
                chunk = track_uris[i:i+100]
                self.sp.playlist_add_items(playlist_id, chunk)

        return playlist
        
    def search_track(self, track_name: str, artist_name: Optional[str] = None) -> List[Track]:
        """
        曲名とアーティスト名（任意）でトラックを検索します。
        """
        query = f"track:{track_name}"
        if artist_name:
            query += f" artist:{artist_name}"

        results = self.sp.search(q=query, type="track", limit=5)
        tracks = [
            Track(
                name=item["name"],
                artist=item["artists"][0]["name"],
                uri=item["uri"]
            )
            for item in results["tracks"]["items"]
        ]
        return tracks
    
    async def search_multiple_tracks(self, queries: List[TrackQuery]) -> (List[Dict[str, Any]], List[TrackQuery]):
        """
        複数のクエリ（曲名とアーティスト名の辞書）で並行してトラックを検索します。
        """
        
        def _search_sync(q: TrackQuery) -> (TrackQuery, Optional[Dict[str, Any]]):
            """同期検索の呼び出しをラップするヘルパー関数。"""
            track_name = q.track
            artist_name = q.artist

            if not track_name:
                return q, None
    
            query = f"track:{track_name}"
            if artist_name:
                query += f" artist:{artist_name}"

            results = self.sp.search(q=query, type="track", limit=1)
            if results["tracks"]["items"]:
                # 元のクエリーと見つかったトラックを返す
                return q, results["tracks"]["items"][0]
            else:
                return q, None

        # 非同期タスクのリストを作成します。
        tasks = [asyncio.to_thread(_search_sync, q) for q in queries]
        # すべてのタスクを並行して実行する
        search_results = await asyncio.gather(*tasks)

        found_tracks = []
        not_found_tracks = []
        for original_query, track_data in search_results:
            if track_data:
                found_tracks.append(track_data)
            else:
                not_found_tracks.append(original_query)

        return found_tracks, not_found_tracks