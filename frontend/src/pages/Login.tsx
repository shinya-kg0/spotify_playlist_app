import { useState } from "react";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/auth/login`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        setError("認証URLが取得できませんでした。");
        console.error("認証URLが取得できませんでした。");
      }
    } catch (err) {
      setError("ログイン処理中にエラーが発生しました。");
      console.error("ログインエラー：", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Spotify Playlist App</h1>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "ログイン中、、、" : "Spotifyでログイン"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;