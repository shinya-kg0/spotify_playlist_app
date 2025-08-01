import os
from dotenv import load_dotenv

import spotipy
from fastapi import APIRouter, Depends
from spotipy.oauth2 import SpotifyOAuth

router = APIRouter()

# 環境変数の読み込み
load_dotenv(verbose=True)

sp_oauth = SpotifyOAuth(
    client_id=os.environ.get("SPOTIPY_CLIENT_ID"),
    client_secret=os.environ.get("SPOTIPY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"),
    scope="playlist-modify-public playlist-modify-private"
)

@router.get("/auth/login")
def login():
    auth_url = sp_oauth.get_authorize_url()
    return {"auth_url": auth_url}

@router.get("/auth/callback")
def callback(code: str):
    token_info = sp_oauth.get_access_token(code)
    return token_info

@router.get("/me")
def get_current_user():
    # （テスト用に直書き：実際はCookieやセッションから取得する）
    access_token = os.getenv("TEST_ACCESS_TOKEN")
    
    sp = spotipy.Spotify(auth=access_token)
    user_info = sp.current_user()
    return user_info