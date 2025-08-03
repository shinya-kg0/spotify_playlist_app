import spotipy
from typing import List, Optional, Dict, Any
import asyncio

class SpotifyService:
    def __init__(self, access_token: str):
        self.sp = spotipy.Spotify(auth=access_token)

    def get_current_user_id(self) -> str:
        """
        現在の認証済みユーザーのIDを取得します。
        """
        return self.sp.current_user()["id"]

    def create_playlist(self, user_id: str, name: str, public: bool, description: str, track_uris: List[str]) -> Dict[str, Any]:
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

        # トラックを追加（URIsが存在する場合のみ）
        if track_uris:
            self.sp.playlist_add_items(playlist_id, track_uris)

        return playlist
        
    def search_track(self, track_name: str, artist_name: Optional[str] = None) -> List[dict]:
        """
        曲名とアーティスト名（任意）でトラックを検索します。
        """
        query = f"track:{track_name}"
        if artist_name:
            query += f" artist:{artist_name}"

        results = self.sp.search(q=query, type="track", limit=5)
        tracks = [
            {
                "name": item["name"],
                "artist": item["artists"][0]["name"],
                "uri": item["uri"]
            }
            for item in results["tracks"]["items"]
        ]
        return tracks
    
    async def search_multiple_tracks(self, queries: List[Dict[str, Any]]):
        """
        複数のクエリ（曲名とアーティスト名の辞書）で並行してトラックを検索します。
        """
        
        def _search_sync(q: Dict[str, Any]):
            """A helper function to wrap the synchronous search call."""
            track_name = q.get("track")
            artist_name = q.get("artist")

            if not track_name:
                return q, None

            query = f"track:{track_name}"
            if artist_name:
                query += f" artist:{artist_name}"

            results = self.sp.search(q=query, type="track", limit=1)
            if results["tracks"]["items"]:
                # Return the original query and the found track
                return q, results["tracks"]["items"][0]
            else:
                # Return the original query and None if not found
                return q, None

        # Create a list of asynchronous tasks
        tasks = [asyncio.to_thread(_search_sync, q) for q in queries]
        # Run all tasks in parallel
        search_results = await asyncio.gather(*tasks)

        found_tracks = []
        not_found_tracks = []
        for original_query, track_data in search_results:
            if track_data:
                found_tracks.append(track_data)
            else:
                not_found_tracks.append(original_query)

        return found_tracks, not_found_tracks