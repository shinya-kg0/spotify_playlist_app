import os
from fastapi import Request, Response, Depends, HTTPException, status
from app.utils.token_utils import TokenManager
from app.services.spotify_service import SpotifyService
import spotipy

from dotenv import load_dotenv

load_dotenv()

# 環境判定
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# .envファイルから設定を読み込み
CLIENT_ID = os.environ.get("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIPY_CLIENT_SECRET")

# リダイレクトURIを環境に応じて設定
def get_redirect_uri():
    """環境に応じたリダイレクトURIを取得"""
    if IS_PRODUCTION:
        # 本番環境：統合後は同一ドメイン
        app_name = os.environ.get("SPOTIPY_REDIRECT_URI")
        if app_name:
            return "https://create-playlist-app-6f538d596202.herokuapp.com/auth/callback"
        else:
            # フォールバック
            return os.environ.get("SPOTIPY_REDIRECT_URI", "https://create-playlist-app-6f538d596202.herokuapp.com/")
    else:
        # 開発環境：ローカルURL
        return os.environ.get("SPOTIPY_REDIRECT_URI", "http://localhost:5173/auth/callback")

REDIRECT_URI = get_redirect_uri()
SCOPE = "playlist-modify-public playlist-modify-private"

# デバッグ用：設定内容を出力
print(f"Environment: {ENVIRONMENT}")
print(f"Redirect URI: {REDIRECT_URI}")
print(f"Client ID: {CLIENT_ID[:8]}..." if CLIENT_ID else "Client ID: Not set")

# 環境変数チェック
if not CLIENT_ID:
    raise ValueError("SPOTIPY_CLIENT_ID environment variable is required")
if not CLIENT_SECRET:
    raise ValueError("SPOTIPY_CLIENT_SECRET environment variable is required")

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