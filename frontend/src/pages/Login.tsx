import { useState } from "react";
import { Box, Button, Heading, Center, VStack, Alert, AlertTitle, Text } from "@chakra-ui/react";
import { authAPI } from "../utils/apiClient";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authAPI.getLoginUrl();

      if (res.ok) {
        const data = await res.json();
        if (data.auth_url) {
          window.location.href = data.auth_url;
        } else {
          setError("認証URLが取得できませんでした。");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.detail || `ログインに失敗しました (ステータス: ${res.status})`;
        setError(message);
      }
    } catch (err) {
      setError("ログイン処理中にエラーが発生しました。");
      console.error("ログインエラー：", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh">
      <Box p={8} borderWidth={1} borderRadius="md" boxShadow="lg" textAlign="center">
        <VStack>
          <Heading as="h1" size="lg" mb={4}>せとぷり！</Heading>
          <Text mb={4}>セットリストからプレイリストへ</Text>
          <Button
            colorScheme="green"
            onClick={handleLogin}
            isLoading={loading}
            loadingText="ログイン中..."
          >
            Spotifyでログイン
          </Button>
          {error && (
            <Alert status="error" mt={4} borderRadius="md">
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </VStack>
      </Box>
    </Center>
  );
}

export default Login;