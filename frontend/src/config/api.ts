// 統合環境でのAPI設定

const isDevelopment = import.meta.env.DEV;

export const getBackendUrl = (): string => {
  if (isDevelopment) {
    // 開発環境：プロキシ経由
    return '/api';
  } else {
    // 本番環境：同一オリジン（空文字でOK）
    return '';
  }
};

export const API_BASE_URL = getBackendUrl();

// デバッグ用
console.log('Environment:', import.meta.env.MODE);
console.log('API Base URL:', API_BASE_URL);