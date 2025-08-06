import { useEffect, useState, type ChangeEvent } from "react";
import { Box, Button, Field, Input, VStack, Heading, Text, Spinner, Alert, Center } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  display_name: string;
}

function Setlist() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // バックエンドに現在のユーザー情報を要求
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else if (res.status === 401) {
          // 認証されていない場合はログインページにリダイレクト
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

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="md" boxShadow="md">
      <Heading as="h1" size="lg" mb={4} textAlign="center">
        プレイリスト作成
      </Heading>
      {user && <Text textAlign="center" mb={4}>ようこそ, {user.display_name} さん！</Text>}
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}
      <Text mb={6} textAlign="center" color="gray.500">
        曲を検索してプレイリストに追加しましょう
      </Text>
      <VStack>
        <Field.Root> {/* FormControl → Field.Root */}
          <Field.Label>曲名</Field.Label> {/* FormLabel → Field.Label */}
          <Input
            placeholder="Lemon"
            value={trackName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackName(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>アーティスト名（任意）</Field.Label>
          <Input
            placeholder="米津玄師"
            value={artistName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setArtistName(e.target.value)}
          />
        </Field.Root>
        <Button colorScheme="teal" width="full">検索</Button>
      </VStack>
    </Box>
  );
}

export default Setlist;