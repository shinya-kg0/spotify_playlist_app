import os
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
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

# 静的ファイルのパス設定
STATIC_DIR = Path(__file__).parent / "static"

# --- CORS設定（統合後は最小限に） ---
if IS_PRODUCTION:
    # 本番環境：同一オリジンのためCORSは最小限
    origins = []  # 同一オリジンのためCORS不要
else:
    # 開発環境：従来通り
    origins = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

if origins:  # 開発環境のみCORSを設定
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# デバッグ用：起動時設定を出力
print(f"Environment: {ENVIRONMENT}")
print(f"Static directory: {STATIC_DIR}")
print(f"CORS Origins: {origins}")

# spotipyライブラリからの例外を一元的に処理するハンドラ
@app.exception_handler(spotipy.exceptions.SpotifyException)
async def spotify_exception_handler(request: Request, exc: spotipy.exceptions.SpotifyException):
    """
    spotipyライブラリが投げる例外を捕捉し、適切なHTTPステータスコードと
    エラーメッセージをJSONレスポンスとして返します。
    """
    status_code = status.HTTP_502_BAD_GATEWAY
    detail = "Spotify APIとの通信中に予期せぬエラーが発生しました。"

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
        "static_dir_exists": STATIC_DIR.exists(),
        "static_files": list(STATIC_DIR.glob("*")) if STATIC_DIR.exists() else []
    }

# APIルーター登録（静的ファイルより先に）
app.include_router(auth.router, prefix="/auth")
app.include_router(playlist.router, prefix="/playlist")

# 静的ファイル配信の設定（本番環境のみ）
if IS_PRODUCTION and STATIC_DIR.exists():
    # 静的アセット用（JS, CSS, 画像など）
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    
    # SPAフォールバック用のカスタムハンドラ
    @app.get("/{path:path}")
    async def serve_spa(path: str):
        """
        SPA用のフォールバックハンドラ。
        存在しないパスはindex.htmlを返す。
        """
        # APIパスは除外
        if path.startswith(("auth/", "playlist/", "health")):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        # 静的ファイル（拡張子あり）の場合
        file_path = STATIC_DIR / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        # その他はすべてindex.htmlを返す（SPAフォールバック）
        index_path = STATIC_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        else:
            return JSONResponse(status_code=500, content={"detail": "Frontend files not found"})
else:
    # 開発環境またはビルドファイルがない場合のルートエンドポイント
    @app.get("/")
    async def root():
        """API情報を返すルートエンドポイント"""
        return {
            "message": "Spotify Playlist API",
            "version": "1.0.0",
            "environment": ENVIRONMENT,
            "docs": "/docs",
            "note": "Frontend files not available in development mode"
        }