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

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast({
        title: "プレイリスト名を入力してください",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/playlist/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          public: isPublic,
          track_uris: playlistTracks.map((t) => t.uri),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        navigate("/result", { state: { playlistUrl: data.url } });
      } else {
        const err = await res.json();
        const errorMessage = err.detail || "プレイリストの作成に失敗しました。";
        setError(errorMessage);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "通信中にエラーが発生しました。";
      setError(errorMessage);
      toast({
        title: "エラー",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setCreating(false);
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
              <AlertIcon />
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
        {/* <HStack spacing={8} align="start"> */}
          {/* 検索結果 */}
          <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" w="100%">
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
          <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" w="100%">
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
        {/* </HStack> */}

        {playlistTracks.length > 0 && (
          <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
            <Heading as="h2" size="lg" mb={4}>4. プレイリストを作成</Heading>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>プレイリスト名</FormLabel>
                <Input
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>説明 <Badge ml={1} colorScheme="gray">任意</Badge></FormLabel>
                <Input
                  placeholder="お気に入りの曲を集めました！"
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>公開設定</FormLabel>
                <ButtonGroup w="full" size="md" isAttached>
                  <Button
                    w="full"
                    variant={!isPublic ? 'solid' : 'outline'}
                    colorScheme={!isPublic ? 'teal' : 'gray'}
                    onClick={() => setIsPublic(false)}
                  >
                    非公開
                  </Button>
                  <Button
                    w="full"
                    variant={isPublic ? 'solid' : 'outline'}
                    colorScheme={isPublic ? 'teal' : 'gray'}
                    onClick={() => setIsPublic(true)}
                  >
                    公開
                  </Button>
                </ButtonGroup>
              </FormControl>
              <Button
                colorScheme="teal"
                size="lg"
                isLoading={creating}
                loadingText="作成中..."
                onClick={handleCreatePlaylist}
              >
                プレイリストを作成する
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default Setlist;