from fastapi import FastAPI
from app.api import auth

from app.utils.token_utils import TokenManager

app = FastAPI()

# ルーター登録
app.include_router(auth.router, prefix="/auth")