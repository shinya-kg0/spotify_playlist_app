import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Center, VStack, Spinner, Text } from "@chakra-ui/react";
import { authAPI } from "../utils/apiClient";

function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("認証処理を実行中...");

  useEffect(() => {
    const exchangeCodeForToken = async (code: string) => {
      try {
        // バックエンドに認可コードを送信してトークンを要求
        const res = await authAPI.exchangeToken(code);

        if (res.ok) {
          const user = await res.json();
          console.log("ログイン成功:", user);
          setMessage("認証完了！リダイレクトします...");
          navigate("/setlist"); // 成功したら次のページへ
        } else {
          const errorData = await res.json();
          setMessage(`認証に失敗しました: ${errorData.detail || '不明なエラー'}`);
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (error) {
        setMessage("エラーが発生しました。ログインページに戻ります。");
        console.error("Error during token exchange:", error);
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setMessage(`認証がキャンセルされました: ${error}`);
      setTimeout(() => navigate("/login"), 3000);
    } else if (code) {
      exchangeCodeForToken(code);
    } else {
      setMessage("認可コードが見つかりません。ログインページに戻ります。");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [navigate, searchParams]);

  return (
    <Center h="100vh">
      <VStack>
        <Spinner size="xl" />
        <Text>{message}</Text>
      </VStack>
    </Center>
  );
}

export default Callback;