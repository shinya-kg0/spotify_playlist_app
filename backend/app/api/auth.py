import os
from datetime import datetime
from dotenv import load_dotenv

import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fastapi import APIRouter, Response, Request, HTTPException
from app.utils.token_utils import TokenManager

router = APIRouter()

# 環境変数の読み込み
load_dotenv(verbose=True)

# SpotifyOAuthオブジェクトとTokenManager初期化
token_manager = TokenManager(
    client_id=os.environ.get("SPOTIPY_CLIENT_ID"),
    client_secret=os.environ.get("SPOTIPY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"),
    scope="playlist-modify-public playlist-modify-private"
)

@router.get("/login")
def login():
    auth_url = token_manager.get_auth_url()
    return {"auth_url": auth_url}

@router.get("/callback")
def callback(code: str, response: Response):
    token_info = token_manager.exchange_code_for_token(code)
    token_manager.set_tokens_in_cookie(response, token_info)
    return {"message": "認証に成功しました。"}

@router.get("/me")
def get_current_user(request: Request, response: Response):
    access_token = token_manager.get_valid_access_token(request, response)
    sp = spotipy.Spotify(auth=access_token)
    try:
        return sp.current_user()
    except spotipy.exceptions.SpotifyException as e:
        if e.http_status == 401: # Invalid access token
            raise HTTPException(status_code=401, detail="認証が必要です。再度ログインしてください。")
        else:
            raise HTTPException(status_code=500, detail="Spotify APIでエラーが発生しました。")