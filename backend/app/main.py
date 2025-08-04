from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, playlist
import spotipy

app = FastAPI()

# --- CORS設定 ---
# フロントエンドのオリジンをリストで指定します。
# ここではReact(Vite)のデフォルト開発サーバーのURLを追加しています。
# 本番環境では、デプロイしたフロントエンドのドメインを追加する必要がある。
origins = [
    "http://localhost:5173",  # Viteのデフォルト
    "http://localhost:3000",  # Create React Appのデフォルト
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # 許可するオリジンのリスト
    allow_credentials=True,      # Cookieを許可するためにTrueに設定
    allow_methods=["*"],         # すべてのHTTPメソッドを許可 (GET, POST, etc.)
    allow_headers=["*"],         # すべてのHTTPヘッダーを許可
)

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

# ルーター登録
app.include_router(auth.router, prefix="/auth")
app.include_router(playlist.router, prefix="/playlist")