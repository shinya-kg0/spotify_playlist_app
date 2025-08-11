import os
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
        
        # 環境判定
        self.environment = os.environ.get("ENVIRONMENT", "development")
        self.is_production = self.environment == "production"

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
        
        # 環境に応じたCookieセキュリティ設定
        if self.is_production:
            # 本番環境：モバイルSafari対応の設定
            common_params = {
                "httponly": True,
                "secure": True,      # HTTPS必須
                "samesite": "lax",   # モバイルSafariでの問題を回避
                "path": "/",
                # domain は明示的に設定しない（自動でサブドメインを含む）
            }
        else:
            # 開発環境：HTTP対応の設定
            common_params = {
                "httponly": True,
                "secure": False,     # HTTP許可
                "samesite": "lax",   # ローカル開発用
                "path": "/",
            }

        # デバッグ用：Cookie設定を出力
        print(f"Environment: {self.environment}")
        print(f"Setting cookies with params: {common_params}")
        print(f"Access token length: {len(access_token) if access_token else 0}")
        print(f"Expires in: {expires_in} seconds")
        print(f"Expires at: {expires_at}")

        try:
            response.set_cookie(key="access_token", value=access_token, max_age=expires_in, **common_params)
            if refresh_token:
                response.set_cookie(key="refresh_token", value=refresh_token, **common_params)
            response.set_cookie(key="expires_at", value=str(expires_at), **common_params)
            print("✅ Cookies set successfully")
        except Exception as e:
            print(f"❌ Failed to set cookies: {e}")
            raise

    def get_valid_access_token(self, request: Request, response: Response):
        """
        Cookieからアクセストークンを取得します。
        有効期限が切れている場合はリフレッシュし、新しいトークンをCookieに再設定します。
        有効なトークンが取得できない場合はHTTPExceptionを送出します。
        """
        access_token = request.cookies.get("access_token")
        expires_at_str = request.cookies.get("expires_at")
        refresh_token = request.cookies.get("refresh_token")

        # デバッグ用：リクエスト情報を出力
        print(f"🔍 Token validation request")
        print(f"  - User Agent: {request.headers.get('user-agent', 'Unknown')}")
        print(f"  - Host: {request.headers.get('host', 'Unknown')}")
        print(f"  - Origin: {request.headers.get('origin', 'Unknown')}")
        print(f"  - Referer: {request.headers.get('referer', 'Unknown')}")
        print(f"  - Cookie header present: {bool(request.headers.get('cookie'))}")
        print(f"  - Available cookies: {list(request.cookies.keys())}")
        print(f"  - Access token present: {bool(access_token)}")
        print(f"  - Refresh token present: {bool(refresh_token)}")
        print(f"  - Expires at: {expires_at_str}")

        # 1. アクセストークンがなければ、即座に認証失敗
        if not access_token:
            print("❌ No access token found in cookies")
            raise HTTPException(
                status_code=401, 
                detail="アクセストークンが見つかりません。ログインしてください。"
            )

        # 2. トークンの有効期限をチェック (expires_atがない場合は安全のため期限切れとみなす)
        is_expired = True
        if expires_at_str:
            try:
                current_time = datetime.now().timestamp()
                expires_at = float(expires_at_str)
                is_expired = current_time > expires_at - 60
                print(f"⏰ Token expiry check: current={current_time}, expires={expires_at}, expired={is_expired}")
            except ValueError as e:
                # expires_at_strが不正な値の場合は期限切れとして扱う
                print(f"❌ Invalid expires_at format: {expires_at_str}, error: {e}")
                is_expired = True
        else:
            print("❌ No expires_at found, treating as expired")
        
        # 3. 有効期限内であれば、現在のトークンを返す
        if not is_expired:
            print("✅ Using valid access token")
            return access_token

        # 4. トークンが期限切れの場合、リフレッシュを試みる
        print("🔄 Access token expired, attempting refresh")
        if not refresh_token:
            print("❌ No refresh token found")
            raise HTTPException(
                status_code=401, 
                detail="セッションの有効期限が切れました。再度ログインしてください。"
            )
        
        try:
            print(f"🔄 Refreshing token...")
            new_token_info = self.refresh_token_if_needed(refresh_token)
            self.set_tokens_in_cookie(response, new_token_info)
            print("✅ Token refreshed successfully")
            return new_token_info["access_token"]
        except Exception as e:
            print(f"❌ Token refresh failed: {e}")
            raise HTTPException(
                status_code=401, 
                detail=f"トークンのリフレッシュに失敗しました: {e}"
            )