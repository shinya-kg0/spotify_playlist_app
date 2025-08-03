from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from app.api import auth, playlist
import spotipy

app = FastAPI()

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