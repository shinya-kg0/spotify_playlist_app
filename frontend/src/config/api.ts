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
    // 本番環境：直接バックエンドのHeroku URLを指定
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://create-playlist-app-backend-e056e71d5a08.herokuapp.com';
    console.log('Production backend URL:', backendUrl);
    return backendUrl;
  } else {
    return '';
  }
};

// APIのベースURL
export const API_BASE_URL = getBackendUrl();

// デバッグ用（開発環境でのみ表示）
console.log('Environment:', import.meta.env.MODE);
console.log('Is Development:', isDevelopment);
console.log('Is Production:', isProduction);
console.log('API Base URL:', API_BASE_URL);