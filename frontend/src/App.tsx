import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import Setlist from "./pages/Setlist"; // 今後作成するページ

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
        {/* デフォルトはログインページに */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;