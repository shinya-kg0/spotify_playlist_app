import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, playlist
import spotipy
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

app = FastAPI(
    title="Spotify Playlist API",
    description="セットリストからSpotifyプレイリストを作成するAPI",
    version="1.0.0"
)

# 環境判定
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# --- CORS設定 ---
def get_cors_origins():
    """環境に応じたCORS許可オリジンを取得"""
    if IS_PRODUCTION:
        # 本番環境：フロントエンドのHeroku URL
        frontend_url = os.environ.get("FRONTEND_URL")
        if frontend_url:
            return [frontend_url]
        else:
            # フォールバック：環境変数が設定されていない場合
            return ["https://your-app-frontend.herokuapp.com"]
    else:
        # 開発環境：ローカル開発用URL
        return [
            "http://localhost:5173",  # Viteのデフォルト
            "http://localhost:3000",  # Create React Appのデフォルト
        ]

origins = get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# デバッグ用：起動時にCORS設定を出力
print(f"Environment: {ENVIRONMENT}")
print(f"CORS Origins: {origins}")

# spotipyライブラリからの例外を一元的に処理するハンドラ
@app.exception_handler(spotipy.exceptions.SpotifyException)
async def spotify_exception_handler(request: Request, exc: spotipy.exceptions.SpotifyException):
    """
    spotipyライブラリが投げる例外を捕捉し、適切なHTTPステータスコードと
    エラーメッセージをJSONレスポンスとして返します。
    """
    # デフォルトは500 Internal Server Error
    status_code = status.HTTP_502_BAD_GATEWAY
    detail = "Spotify APIとの通信中に予期せぬエラーが発生しました。"

    # Spotify APIから返されたHTTPステータスコードがあれば、それをクライアントに返す
    if exc.http_status:
        status_code = exc.http_status
        detail = f"Spotify APIエラー: {exc.msg}"

    return JSONResponse(status_code=status_code, content={"detail": detail})

# ヘルスチェック用エンドポイント
@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "cors_origins": origins
    }

# ルート用エンドポイント
@app.get("/")
async def root():
    """API情報を返すルートエンドポイント"""
    return {
        "message": "Spotify Playlist API",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "docs": "/docs"
    }

# ルーター登録
app.include_router(auth.router, prefix="/auth")
app.include_router(playlist.router, prefix="/playlist")