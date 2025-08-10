// API設定を環境に応じて切り替え

// 環境変数から取得（本番環境）
declare const __BACKEND_URL__: string;

// 環境判定
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// バックエンドURLの決定
export const getBackendUrl = (): string => {
  if (isDevelopment) {
    // 開発環境：プロキシを使用するため空文字
    return '/api';
  } else if (isProduction) {
    // 本番環境：環境変数から取得
    return __BACKEND_URL__ || 'https://create-playlist-app-backend-e056e71d5a08.herokuapp.com';
  } else {
    return '';
  }
};

// APIのベースURL
export const API_BASE_URL = getBackendUrl();

// デバッグ用（開発環境でのみ表示）
if (isDevelopment) {
  console.log('Environment:', import.meta.env.MODE);
  console.log('API Base URL:', API_BASE_URL);
}