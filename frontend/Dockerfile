# ベースイメージの指定
FROM node:20

# ARGとしてローカルの$USERを受け取れるようにする（デフォルトはdeveloper）
ARG USER=${USER:-developer}
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# 必要なパッケージのインストール（例：git, vim）
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    vim \
    bash \
    && rm -rf /var/lib/apt/lists/*

# ユーザー作成（ローカルと同じ名前＆UID/GIDで作成）
RUN groupadd --gid $USER_GID $USER \
    && useradd --uid $USER_UID --gid $USER_GID -m $USER -s /bin/bash

# 作業ディレクトリ設定＆権限変更
WORKDIR /app
RUN chown -R $USER:$USER /app

# package.jsonとlockファイルを先にコピー（依存関係インストール用）
COPY package*.json ./

# クリーンインストールで環境差分回避
RUN npm ci

# アプリコードコピー
COPY . .
RUN chown -R $USER:$USER /app

# 非rootユーザーに切り替え
USER $USER

# プロンプトをわかりやすく設定
RUN echo 'export PS1="[\u@\h \W]\\$ "' >> /home/$USER/.bashrc

# 開発サーバー起動
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]