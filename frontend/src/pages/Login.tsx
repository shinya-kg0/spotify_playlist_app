import { useState } from "react";
import { Box, Button, Heading, Center, VStack, Alert } from "@chakra-ui/react";

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
    <Center h="100vh">
      <Box p={8} borderWidth={1} borderRadius="md" boxShadow="lg" textAlign="center">
        <VStack>
          <Heading as="h1" size="lg">Spotify Playlist App</Heading>
          <Button
            colorScheme="green"
            onClick={handleLogin}
            loading={loading}
            loadingText="ログイン中..."
          >
            Spotifyでログイン
          </Button>
          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>{error}</Alert.Title>
            </Alert.Root>
          )}
        </VStack>
      </Box>
    </Center>
  );
}

export default Login;