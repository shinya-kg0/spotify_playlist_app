import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../types";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else if (res.status === 401) {
          setError("認証されていません。ログインページにリダイレクトします。");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          const errorData = await res.json();
          setError(errorData.detail || "ユーザー情報の取得に失敗しました。");
        }
      } catch (err) {
        setError("ユーザー情報の取得中にエラーが発生しました。");
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  return { user, loading, error };
}