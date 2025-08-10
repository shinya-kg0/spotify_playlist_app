import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Center, VStack, Spinner, Text, Box, Code } from "@chakra-ui/react";
import { authAPI } from "../utils/apiClient";
import { API_BASE_URL } from "../config/api";

function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("認証処理を実行中...");
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  const addDebugInfo = (info: string, data?: any) => {
    const timestamp = new Date().toISOString();
    setDebugInfo(prev => [...prev, { timestamp, info, data }]);
    console.log(`[${timestamp}] ${info}`, data);
  };

  useEffect(() => {
    const exchangeCodeForToken = async (code: string) => {
      try {
        addDebugInfo("Starting token exchange", { code: code.substring(0, 20) + "..." });
        addDebugInfo("API Base URL", API_BASE_URL);
        addDebugInfo("User Agent", navigator.userAgent);
        addDebugInfo("Current cookies", document.cookie);

        // バックエンドに認可コードを送信してトークンを要求
        const res = await authAPI.exchangeToken(code);
        
        addDebugInfo("Token exchange response", {
          status: res.status,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries())
        });

        if (res.ok) {
          const user = await res.json();
          addDebugInfo("Login success", user);
          setMessage("認証完了！リダイレクトします...");
          
          // Cookieが設定されたか確認
          setTimeout(() => {
            addDebugInfo("Cookies after login", document.cookie);
          }, 100);
          
          navigate("/setlist");
        } else {
          const errorData = await res.json();
          addDebugInfo("Login failed", { status: res.status, error: errorData });
          setMessage(`認証に失敗しました: ${errorData.detail || '不明なエラー'}`);
          setTimeout(() => navigate("/login"), 5000);
        }
      } catch (error: any) {
        addDebugInfo("Exception during token exchange", {
          message: error.message,
          stack: error.stack
        });
        setMessage("エラーが発生しました。ログインページに戻ります。");
        console.error("Error during token exchange:", error);
        setTimeout(() => navigate("/login"), 5000);
      }
    };

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    addDebugInfo("Callback page loaded", { 
      url: window.location.href,
      hasCode: !!code,
      hasError: !!error
    });

    if (error) {
      addDebugInfo("Auth error from Spotify", error);
      setMessage(`認証がキャンセルされました: ${error}`);
      setTimeout(() => navigate("/login"), 3000);
    } else if (code) {
      exchangeCodeForToken(code);
    } else {
      addDebugInfo("No code or error found");
      setMessage("認可コードが見つかりません。ログインページに戻ります。");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [navigate, searchParams]);

  return (
    <Center h="100vh" p={4}>
      <VStack spacing={4} w="100%" maxW="800px">
        <Spinner size="xl" />
        <Text fontSize="lg">{message}</Text>
        
        {/* デバッグ情報表示 */}
        <Box w="100%" maxH="400px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
          <Text fontWeight="bold" mb={2}>Debug Information:</Text>
          {debugInfo.map((item, index) => (
            <Box key={index} mb={2} fontSize="sm">
              <Text color="blue.600">[{item.timestamp}] {item.info}</Text>
              {item.data && (
                <Code p={1} display="block" whiteSpace="pre-wrap" fontSize="xs">
                  {typeof item.data === 'object' ? JSON.stringify(item.data, null, 2) : item.data}
                </Code>
              )}
            </Box>
          ))}
        </Box>
      </VStack>
    </Center>
  );
}

export default Callback;