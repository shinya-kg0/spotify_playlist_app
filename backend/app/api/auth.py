import spotipy
from fastapi import APIRouter, Response, Request, HTTPException, Depends, status
from app.utils.token_utils import TokenManager
from app.dependencies import get_token_manager, get_spotify_service
from app.schemas import UserProfile
from app.services.spotify_service import SpotifyService

router = APIRouter()

@router.get("/login")
def login(token_manager: TokenManager = Depends(get_token_manager)):
    """Spotifyの認証ページへのURLを取得します。"""
    auth_url = token_manager.get_auth_url()
    return {"auth_url": auth_url}

@router.get("/callback")
def callback(code: str, response: Response, token_manager: TokenManager = Depends(get_token_manager)):
    """Spotifyからのコールバックを処理し、トークンをCookieに保存します。"""
    token_info = token_manager.exchange_code_for_token(code)
    token_manager.set_tokens_in_cookie(response, token_info)
    return {"message": "認証に成功しました。"}

@router.get("/me", response_model=UserProfile)
def get_current_user(spotify_service: SpotifyService = Depends(get_spotify_service)):
    """
    現在認証しているユーザーのプロフィール情報を返します。
    認証は `get_spotify_service` 依存関係によって処理されます。
    """
    user_data = spotify_service.sp.current_user()
    return UserProfile.model_validate(user_data)