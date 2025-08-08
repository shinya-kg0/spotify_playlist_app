import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import Setlist from "./pages/Setlist"; // 今後作成するページ
import Result from "./pages/Result";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ログインページ */}
        <Route path="/login" element={<Login />} />
        {/* Spotifyからのコールバックを受け取るページ */}
        <Route path="/auth/callback" element={<Callback />} />
        {/* ログイン後のメインページ（今後作成） */}
        <Route path="/setlist" element={<Setlist />} />
        {/* プレイリスト作成完了ページ */}
        <Route path="/result" element={<Result />} />
        {/* デフォルトはログインページに */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;