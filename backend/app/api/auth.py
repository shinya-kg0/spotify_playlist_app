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

@router.get("/login")
def login(token_manager: TokenManager = Depends(get_token_manager)):
    """Spotifyの認証ページへのURLを取得します。"""
    auth_url = token_manager.get_auth_url()
    return {"auth_url": auth_url}

@router.get("/callback")
def spotify_callback(
    request: Request,
    token_manager: TokenManager = Depends(get_token_manager)
):
    """
    Spotifyからのリダイレクトを受け取り、トークン交換、Cookie設定後、
    フロントエンドのメインページにリダイレクトします。
    ITP対策として、サーバーサイドで認証を完結させます。
    """
    try:
        frontend_url = os.environ.get("FRONTEND_URL")
        if not frontend_url:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="FRONTEND_URL is not configured on the server.")

        code = request.query_params.get("code")
        if not code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code not found in callback.")

        # 1. 認可コードをアクセストークンに交換
        token_info = token_manager.exchange_code_for_token(code)

        # 2. リダイレクトレスポンスを作成（303推奨）
        resp = RedirectResponse(url=f"{frontend_url}/setlist", status_code=status.HTTP_303_SEE_OTHER)

        # 3. 作成したレスポンスに対して Cookie を設定（返すレスポンスと同一インスタンス）
        token_manager.set_tokens_in_cookie(resp, token_info)

        # 4. 返却
        return resp

    except Exception:
        frontend_url = os.environ.get("FRONTEND_URL", "/")  # エラー時もフォールバック
        # エラーが発生した場合は、エラー情報をクエリパラメータとしてフロントエンドに渡すことも可能
        return RedirectResponse(url=f"{frontend_url}/login?error=auth_failed", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/me", response_model=UserProfile)
def get_current_user(spotify_service: SpotifyService = Depends(get_spotify_service)):
    """
    現在認証しているユーザーのプロフィール情報を返します。
    認証は `get_spotify_service` 依存関係によって処理されます。
    """
    user_data = spotify_service.sp.current_user()
    return UserProfile.model_validate(user_data)