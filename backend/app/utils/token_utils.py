import time
from datetime import datetime
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fastapi import Request, Response, HTTPException

class TokenManager:
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str, scope: str):
        self.sp_oauth = SpotifyOAuth(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scope=scope
        )

    def get_auth_url(self):
        """認証用のURLを生成して返します。"""
        return self.sp_oauth.get_authorize_url()

    def exchange_code_for_token(self, code: str):
        """認可コードをアクセストークンと交換します。"""
        return self.sp_oauth.get_access_token(code)

    def refresh_token_if_needed(self, refresh_token: str):
        """リフレッシュトークンを使い、新しいアクセストークンを取得します。"""
        return self.sp_oauth.refresh_access_token(refresh_token)

    def set_tokens_in_cookie(self, response: Response, token_info: dict):
        """取得したトークン情報をHTTPOnlyのCookieに設定します。"""
        access_token = token_info["access_token"]
        expires_in = token_info["expires_in"]
        refresh_token = token_info.get("refresh_token")
        expires_at = token_info.get("expires_at", int(time.time()) + expires_in)

        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=3600)
        if refresh_token:
            response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax")
        response.set_cookie(key="expires_at", value=str(expires_at), httponly=True, secure=True, samesite="lax")

    def get_valid_access_token(self, request: Request, response: Response):
        """
        Cookieからアクセストークンを取得します。
        有効期限が切れている場合はリフレッシュし、新しいトークンをCookieに再設定します。
        有効なトークンが取得できない場合はHTTPExceptionを送出します。
        """
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")
        expires_at = request.cookies.get("expires_at")

        if not access_token or not refresh_token or not expires_at:
            raise HTTPException(status_code=401, detail="認証されていません。")

        # トークンの有効期限が残り60秒未満かチェック
        is_expired = datetime.now().timestamp() > float(expires_at) - 60
        if is_expired:
            try:
                new_token_info = self.refresh_token_if_needed(refresh_token)
                self.set_tokens_in_cookie(response, new_token_info)
                access_token = new_token_info["access_token"]
            except Exception as e:
                raise HTTPException(status_code=401, detail=f"トークンのリフレッシュに失敗しました: {e}")

        return access_token
