FROM python:3.11-slim

# 作業ディレクトリ設定
WORKDIR /app

# 必要なパッケージをインストール（SpotipyやFastAPI用）
COPY ./app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# FastAPIサーバー起動（開発用: Hot Reload）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]