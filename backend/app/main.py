from fastapi import FastAPI
from app.api import auth, playlist

from app.utils.token_utils import TokenManager

app = FastAPI()

# ルーター登録
app.include_router(auth.router, prefix="/auth")
app.include_router(playlist.router, prefix="/playlist")