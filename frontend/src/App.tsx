import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import Setlist from "./pages/Setlist";
import Result from "./pages/Result";
import Debug from "./pages/Debug"; // デバッグページを追加

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ログインページ */}
        <Route path="/login" element={<Login />} />
        {/* Spotifyからのコールバックを受け取るページ */}
        <Route path="/auth/callback" element={<Callback />} />
        {/* ログイン後のメインページ */}
        <Route path="/setlist" element={<Setlist />} />
        {/* プレイリスト作成完了ページ */}
        <Route path="/result" element={<Result />} />
        {/* デバッグページ - モバイルでのトラブルシューティング用 */}
        <Route path="/debug" element={<Debug />} />
        {/* デフォルトはログインページに */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;