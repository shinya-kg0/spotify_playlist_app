import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  display_name: string;
}

function Setlist() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ここにユーザー情報を取得するAPI呼び出しや、
    // 曲検索、プレイリスト作成のロジックを実装していきます。
    console.log("Setlist page mounted");
  }, []);

  return (
    <div>
      <h1>プレイリスト作成</h1>
      <p>このページで曲を検索し、プレイリストを作成します。</p>
    </div>
  );
}

export default Setlist;