import { useEffect, useState, type ChangeEvent } from "react";
import { Box, Button, Field, Input, VStack, Heading, Text, Spinner, Alert, List, Center, ListItem, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  display_name: string;
}

interface Track {
  id: string;
  name: string;
  artist: string;
  uri: string;
}

function Setlist() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);

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

  const handleSearch = async () => {
    try {
      const query = new URLSearchParams();
      query.append("track_name", trackName);
      if (artistName) query.append("artist_name", artistName);

      const res = await fetch(`/api/playlist/search?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTracks(data);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "検索に失敗しました。");
      }
    } catch (err) {
      setError("検索中にエラーが発生しました。");
      console.error("Failed to search track:", err);
    }
  };

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
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}
      <Text mb={6} textAlign="center" color="gray.500">
        曲を検索してプレイリストに追加しましょう
      </Text>
      <VStack>
        <Field.Root>
          <Field.Label>アーティスト名（任意）</Field.Label>
          <Input
            placeholder="米津玄師"
            value={artistName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setArtistName(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>曲名</Field.Label>
          <Input
            placeholder="Lemon"
            value={trackName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackName(e.target.value)}
          />
        </Field.Root>
        <Button colorScheme="teal" width="full" onClick={handleSearch}>検索</Button>

        {tracks.length > 0 && (
          <Box w="full" mt={4}>
            <Heading as="h2" size="md" mb={2}>検索結果</Heading>
            <List.Root>
              {tracks.map((track) => (
                <ListItem key={track.id} p={2} borderWidth={1} borderRadius="md">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="bold">{track.name}</Text>
                      <Text fontSize="sm" color="gray.500">{track.artist}</Text>
                    </Box>
                    <Button size="sm" colorScheme="teal">追加</Button>
                  </HStack>
                </ListItem>
              ))}
            </List.Root>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default Setlist;