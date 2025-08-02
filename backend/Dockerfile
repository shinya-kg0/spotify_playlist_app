FROM python:3.11-slim

# ローカルの$USERをビルド引数から受け取る（デフォルトはdeveloper）
ARG USER=developer
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    bash \
    && rm -rf /var/lib/apt/lists/*

# ローカルと同じユーザー名＆UIDで作成
RUN groupadd --gid $USER_GID $USER \
    && useradd --uid $USER_UID --gid $USER_GID -m $USER -s /bin/bash

# 作業ディレクトリ作成＆権限変更
WORKDIR /app
RUN chown -R $USER:$USER /app

# requirementsインストール（root権限）
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリコードコピー
COPY . .
RUN chown -R $USER:$USER /app

# 非rootユーザーに切り替え
USER $USER

# プロンプトをわかりやすく設定
RUN echo 'export PS1="[\u@\h \W]\\$ "' >> /home/$USER/.bashrc

# FastAPI起動
CMD ["bash", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]