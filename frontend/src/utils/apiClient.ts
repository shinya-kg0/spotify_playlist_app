import { API_BASE_URL } from '../config/api';

// API呼び出し用のヘルパー関数
export const apiCall = (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // デフォルト設定
  const defaultOptions: RequestInit = {
    credentials: 'include', // Cookieを含める
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log(`API Call: ${options.method || 'GET'} ${url}`);
  
  return fetch(url, defaultOptions);
};

// 各種API呼び出し関数
export const authAPI = {
  // ログインURL取得
  getLoginUrl: () => apiCall('/auth/login'),
  
  // トークン交換
  exchangeToken: (code: string) => apiCall('/auth/token', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
  
  // ユーザー情報取得
  getCurrentUser: () => apiCall('/auth/me'),
};

export const playlistAPI = {
  // 単曲検索
  searchTrack: (params: URLSearchParams) => apiCall(`/playlist/search?${params.toString()}`),
  
  // 複数曲検索
  searchMultipleTracks: (queries: any[]) => apiCall('/playlist/search/multiple', {
    method: 'POST',
    body: JSON.stringify(queries),
  }),
  
  // プレイリスト作成
  createPlaylist: (data: any) => apiCall('/playlist/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};