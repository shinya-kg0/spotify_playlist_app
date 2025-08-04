import os
import spotipy
from fastapi import APIRouter, Response, Request, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from app.utils.token_utils import TokenManager
from app.dependencies import get_token_manager, get_spotify_service
from app.schemas import TokenRequest, UserProfile
from app.services.spotify_service import SpotifyService
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

FRONTEND_URL = os.environ.get("FRONTEND_URL")

@router.get("/login")
def login(token_manager: TokenManager = Depends(get_token_manager)):
    """Spotifyの認証ページへのURLを取得します。"""
    auth_url = token_manager.get_auth_url()
    return {"auth_url": auth_url}

@router.post("/token", response_model=UserProfile)
def exchange_token(token_request: TokenRequest, response: Response, token_manager: TokenManager = Depends(get_token_manager)):
    """
    フロントエンドから受け取った認可コードをトークンと交換し、Cookieに保存します。
    成功時にはユーザー情報を返します。
    """
    try:
        token_info = token_manager.exchange_code_for_token(token_request.code)
        token_manager.set_tokens_in_cookie(response, token_info)
        # Cookie設定後、そのトークンを使ってユーザー情報を取得して返す
        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_data = sp.current_user()
        return UserProfile.model_validate(user_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"トークンの交換に失敗しました: {e}")

@router.get("/me", response_model=UserProfile)
def get_current_user(spotify_service: SpotifyService = Depends(get_spotify_service)):
    """
    現在認証しているユーザーのプロフィール情報を返します。
    認証は `get_spotify_service` 依存関係によって処理されます。
    """
    user_data = spotify_service.sp.current_user()
    return UserProfile.model_validate(user_data)