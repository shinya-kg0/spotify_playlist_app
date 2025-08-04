import os
from fastapi import Request, Response, Depends, HTTPException, status
from app.utils.token_utils import TokenManager
from app.services.spotify_service import SpotifyService
import spotipy

from dotenv import load_dotenv

load_dotenv()

# .envファイルから設定を読み込み
CLIENT_ID = os.environ.get("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIPY_CLIENT_SECRET")
REDIRECT_URI = os.environ.get("SPOTIPY_REDIRECT_URI")
SCOPE = "playlist-modify-public playlist-modify-private"

# アプリケーション全体で共有するTokenManagerのシングルトンインスタンス
token_manager = TokenManager(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE
)

def get_token_manager() -> TokenManager:
    """TokenManagerのインスタンスを返す依存関係関数。"""
    return token_manager

def get_spotify_service(request: Request, response: Response, tm: TokenManager = Depends(get_token_manager)) -> SpotifyService:
    """
    有効なアクセストークンを取得し、SpotifyServiceのインスタンスを生成する依存関係。
    トークンが無効、またはリフレッシュが必要な場合は自動で処理します。
    """
    access_token = tm.get_valid_access_token(request, response)
    return SpotifyService(access_token=access_token)