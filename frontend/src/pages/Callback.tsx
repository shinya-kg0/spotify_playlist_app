import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Callback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("認証情報を確認中...");

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        // バックエンドに認証状態の確認をリクエスト
        const res = await fetch(`${apiUrl}/me`, {
          method: "GET",
          credentials: "include", // Cookieを送信するために必要
        });

        if (res) {
          // 認証成功
          setMessage("認証完了！リダイレクト中...");
          // ユーザー情報を取得して状態管理ライブラリ（Context, Reduxなど）に保存することも可能
          // const user = await res.json();
          navigate("/setlist"); // 次のページへ
        } else {
          // 認証失敗
          setMessage("認証に失敗しました。ログインページに戻ります。");
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (error) {
        setMessage("エラーが発生しました。ログインページに戻ります。");
        console.error("Error during user verification:", error);
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    verifyLogin();
  }, [navigate]);

  return <div>{message}</div>;
}

export default Callback;