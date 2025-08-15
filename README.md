# せとぷり！ - Spotify Playlist Creator

**セットリストからプレイリストへ** - コンサートのセットリストから簡単にSpotifyプレイリストを作成できるWebアプリケーション

## プロジェクト概要

ライブやコンサートのセットリストを元に、自動でSpotifyプレイリストを作成するアプリケーションです。
アーティスト名と曲名リストを入力するだけで、Spotify上にプレイリストを生成できます。

公演後に一曲ずつSpotifyでプレイリストに追加していく面倒な作業を解放します。

### 主な機能

- **Spotify認証**: OAuth 2.0を使用したセキュアな認証
- **楽曲検索**: 単曲検索とセットリスト一括検索の両対応
- **ドラッグ&ドロップ**: 直感的なUI/UXでプレイリスト順序の調整
- **プレイリスト作成**: 公開/非公開設定可能なプレイリスト生成
- **レスポンシブデザイン**: モバイル・デスクトップ両対応

## 技術スタック

### フロントエンド
- **React 18** + **TypeScript** - モダンなフロントエンド開発
- **Vite** - 高速なビルドツール
- **Chakra UI** - コンポーネントベースのUIライブラリ
- **React Router** - SPA用ルーティング

### バックエンド  
- **FastAPI** - 高性能なPython Webフレームワーク
- **Spotipy** - Spotify Web API クライアント
- **Uvicorn** - ASGI サーバー
- **Pydantic** - データバリデーション

### インフラ・開発環境
- **Heroku** - クラウドデプロイメント
- **Docker** + **Docker Compose** - コンテナ化された開発環境

## アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │───▶│   FastAPI       │───▶│  Spotify API    │
│   (Frontend)    │    │   (Backend)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └─────────────▶│   Heroku        │◀────────────┘
                        │   (Deployment)  │
                        └─────────────────┘
```

### 統合デプロイメント設計

- **本番環境**: FastAPIが静的ファイル配信とAPI両方を担当する統合構成
- **開発環境**: Viteプロキシ経由でReact開発サーバーとFastAPIを連携

## セットアップ

### 前提条件

- Node.js 20.x
- Python 3.11
- Docker & Docker Compose
- Spotify Developer アカウント

### 環境変数設定

```bash
# backend/.env
SPOTIPY_CLIENT_ID=your_spotify_client_id
SPOTIPY_CLIENT_SECRET=your_spotify_client_secret
SPOTIPY_REDIRECT_URI=http://localhost:5173/auth/callback
ENVIRONMENT=development
```

### ローカル開発

```bash
# Docker Composeで開発環境を起動
docker-compose up --build

# または個別に起動
# Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev

# Backend (http://localhost:8000)  
cd backend && pip install -r app/requirements.txt && uvicorn app.main:app --reload
```

## 使用方法

1. **認証**: Spotifyアカウントでログイン
2. **検索**: 
   - 単曲検索: アーティスト名・曲名で個別検索
   - 一括検索: セットリストを貼り付けて一括処理
3. **編集**: ドラッグ&ドロップで曲順調整
4. **作成**: プレイリスト名・公開設定を選択して作成完了

## 技術的な取り組み

### フロントエンド

- **Custom Hooks**: `useAuth`, `usePlaylist`, `useTrackSearch`で状態管理をモジュール化
- **TypeScript**: 型安全性を重視した開発
- **コンポーネント設計**: 再利用可能な UI コンポーネント
- **非同期処理**: async/awaitを使った効率的なAPI通信

### バックエンド

- **依存性注入**: FastAPIの依存関係システムを活用
- **エラーハンドリング**: spotipy例外の統一的な処理
- **トークン管理**: Cookie based認証でセキュリティ確保
- **並行処理**: asyncioによる複数楽曲の並列検索

### DevOps

- **統合デプロイ**: フロントエンドビルド成果物をバックエンドで配信
- **環境分離**: 開発/本番環境の適切な設定管理
- **Docker化**: 開発環境の一貫性確保

## セキュリティ対策

- OAuth 2.0 による安全な認証フロー  
- HTTPOnly Cookie による XSS 攻撃対策
- CORS 設定による適切なオリジン制御
- 環境変数による機密情報管理
