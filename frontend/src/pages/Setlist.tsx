import { useEffect, useState, type ChangeEvent } from "react";
import {
  Box,
  Badge,
  Button,
  ButtonGroup,
  Center,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  List,
  ListItem,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
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

  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

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
    if (!trackName.trim()) {
      toast({
        title: "曲名を入力してください",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setError(null);

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
    <Box maxW="3xl" mx="auto" my={10} p={4}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2} textAlign="center">
            Spotify プレイリスト作成
          </Heading>
          {user && <Text textAlign="center" color="gray.500">ようこそ, {user.display_name} さん！</Text>}
          {error && (
            <Alert status="error" mt={4} borderRadius="md">
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </Box>

        {/* 1. 曲を検索 */}
        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
          <Heading as="h2" size="lg" mb={4}>1. 曲を検索</Heading>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>アーティスト名 <Badge ml={1} colorScheme="gray">任意</Badge></FormLabel>
              <Input
                placeholder="米津玄師"
                value={artistName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setArtistName(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>曲名</FormLabel>
              <Input
                placeholder="Lemon"
                value={trackName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackName(e.target.value)}
              />
            </FormControl>
            <Button colorScheme="teal" width="full" onClick={handleSearch}>検索する</Button>
          </VStack>
        </Box>

        {/* 2. 検索結果 & 3. プレイリストの曲 */}
        <HStack spacing={8} align="start">
          {/* 検索結果 */}
          <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" w="50%">
            <Heading as="h2" size="lg" mb={4}>2. 検索結果</Heading>
            <List spacing={3}>
              {tracks.map((track) => (
                <ListItem key={track.id} p={3} borderWidth={1} borderRadius="md" _hover={{ bg: "gray.50" }}>
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="bold">{track.name}</Text>
                      <Text fontSize="sm" color="gray.500">{track.artist}</Text>
                    </Box>
                    <Button size="sm" colorScheme="teal" variant="outline" onClick={() => {
                      if (!playlistTracks.some(t => t.id === track.id)) {
                        setPlaylistTracks([...playlistTracks, track]);
                      }
                    }}>追加</Button>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* プレイリスト候補 */}
          <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" w="50%">
            <Heading as="h2" size="lg" mb={4}>3. プレイリストの曲</Heading>
            <List spacing={3}>
              {playlistTracks.map((track) => (
                <ListItem key={track.id} p={3} borderWidth={1} borderRadius="md" _hover={{ bg: "gray.50" }}>
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="bold">{track.name}</Text>
                      <Text fontSize="sm" color="gray.500">{track.artist}</Text>
                    </Box>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => {
                      setPlaylistTracks(playlistTracks.filter(t => t.id !== track.id));
                    }}>削除</Button>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
}

export default Setlist;