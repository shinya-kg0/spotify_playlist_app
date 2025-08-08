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
  Icon,
} from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";
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

// ドラッグ可能なListItemコンポーネント
interface DraggableTrackItemProps {
  track: Track;
  index: number;
  onRemove: (track: Track) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnter: (index: number) => void;
  onDragLeave: () => void;
  isDragging: boolean;
  showInsertLine: boolean;
}

function DraggableTrackItem({
  track,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  isDragging,
  showInsertLine,
}: DraggableTrackItemProps) {
  return (
    <>
      {/* 挿入位置インジケーター */}
      {showInsertLine && (
        <Box
          h="2px"
          bg="blue.400"
          borderRadius="1px"
          mx={2}
          mb={2}
          opacity={0.8}
          boxShadow="0 0 4px rgba(66, 153, 225, 0.6)"
        />
      )}
      
      <ListItem
        p={3}
        borderWidth={1}
        borderRadius="md"
        _hover={{ bg: "gray.50" }}
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
        onDragEnter={() => onDragEnter(index)}
        onDragLeave={onDragLeave}
        opacity={isDragging ? 0.5 : 1}
        cursor="grab"
        _active={{ cursor: "grabbing" }}
      >
        <HStack spacing={3}>
          {/* ドラッグハンドル */}
          <Icon
            as={DragHandleIcon}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            cursor="grab"
            _active={{ cursor: "grabbing" }}
          />
          
          {/* 曲情報 */}
          <Box flex={1}>
            <Text fontWeight="bold">{track.name}</Text>
            <Text fontSize="sm" color="gray.500">{track.artist}</Text>
          </Box>
          
          {/* 削除ボタン */}
          <Button 
            size="sm" 
            colorScheme="red" 
            variant="outline" 
            onClick={() => onRemove(track)}
          >
            削除
          </Button>
        </HStack>
      </ListItem>
    </>
  );
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
  
  // ドラッグ&ドロップの状態管理
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null); // ドラッグオーバー中の要素のインデックス
  const [dragOverTimeout, setDragOverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null); // ドラッグオーバーのタイムアウトID
  
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

  // ドラッグ開始時の処理
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  // ドラッグオーバー時の処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // ドロップ時の処理
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    // タイムアウトをクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
      setDragOverTimeout(null);
    }
    setDragOverIndex(null);
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newTracks = [...playlistTracks];
    const draggedTrack = newTracks[draggedIndex];
    
    // 元の位置から削除
    newTracks.splice(draggedIndex, 1);
    
    // 新しい位置に挿入
    newTracks.splice(dropIndex, 0, draggedTrack);
    
    setPlaylistTracks(newTracks);
    setDraggedIndex(null);
  };

  // ドラッグエンター時の処理（ディレイ付き）
  const handleDragEnter = (index: number) => {
    // 既存のタイムアウトをクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
    }
    
    // 200msのディレイでハイライト表示
    const timeout = setTimeout(() => {
      setDragOverIndex(index);
    }, 200);
    
    setDragOverTimeout(timeout);
  };

  // ドラッグリーブ時の処理
  const handleDragLeave = () => {
    // タイムアウトをクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
      setDragOverTimeout(null);
    }
    setDragOverIndex(null);
  };

  // 曲を追加する処理
  const addToPlaylist = (track: Track) => {
    if (!playlistTracks.some(t => t.id === track.id)) {
      setPlaylistTracks([...playlistTracks, track]);
      toast({
        title: "曲を追加しました",
        description: `${track.name} - ${track.artist}`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } else {
      toast({
        title: "この曲は既に追加されています",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // 曲を削除する処理
  const removeFromPlaylist = (track: Track) => {
    // ドラッグ関連の状態をクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
      setDragOverTimeout(null);
    }
    setDragOverIndex(null);
    setDraggedIndex(null);
    
    setPlaylistTracks(playlistTracks.filter(t => t.id !== track.id));
    toast({
      title: "曲を削除しました",
      description: `${track.name} - ${track.artist}`,
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top",
    });
  };

  // プレイリスト作成処理
  const handleCreatePlaylist = async () => {
    if (playlistTracks.length === 0) {
      toast({
        title: "プレイリストに曲が追加されていません",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: playlistName,
        description: playlistDescription,
        public: isPublic,
        track_uris: playlistTracks.map(track => track.uri),
      };

      const res = await fetch("/api/playlist/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdPlaylist = await res.json();
        toast({
          title: "プレイリストを作成しました！",
          description: `${createdPlaylist.name} (${createdPlaylist.track_count}曲)`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        
        // フォームをリセット
        setPlaylistTracks([]);
        setPlaylistName("My Playlist");
        setPlaylistDescription("");
        setIsPublic(false);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "プレイリストの作成に失敗しました。");
      }
    } catch (err) {
      setError("プレイリスト作成中にエラーが発生しました。");
      console.error("Failed to create playlist:", err);
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
    <Box maxW="4xl" mx="auto" my={10} p={4}>
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
                placeholder="Artist"
                value={artistName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setArtistName(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>曲名</FormLabel>
              <Input
                placeholder="Track"
                value={trackName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
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
            {tracks.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                曲名を入力して検索してください
              </Text>
            ) : (
              <List spacing={3}>
                {tracks.map((track) => (
                  <ListItem key={track.id} p={3} borderWidth={1} borderRadius="md" _hover={{ bg: "gray.50" }}>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="bold">{track.name}</Text>
                        <Text fontSize="sm" color="gray.500">{track.artist}</Text>
                      </Box>
                      <Button 
                        size="sm" 
                        colorScheme="teal" 
                        variant="outline" 
                        onClick={() => addToPlaylist(track)}
                      >
                        追加
                      </Button>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* プレイリスト候補 */}
          <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" w="50%">
            <Heading as="h2" size="lg" mb={4}>
              3. プレイリストの曲
            </Heading>
            {playlistTracks.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                検索結果から曲を追加してください
              </Text>
            ) : (
              <>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  <Icon as={DragHandleIcon} mr={1} />
                  ドラッグして曲順を変更できます
                </Text>
                <List spacing={3}>
                  {playlistTracks.map((track, index) => (
                    <DraggableTrackItem
                      key={track.id}
                      track={track}
                      index={index}
                      onRemove={removeFromPlaylist}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      isDragging={draggedIndex === index}
                      showInsertLine={dragOverIndex === index && draggedIndex !== index}
                    />
                  ))}
                </List>
              </>
            )}
          </Box>
        </HStack>

        {/* 4. プレイリスト作成設定 */}
        {playlistTracks.length > 0 && (
          <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
            <Heading as="h2" size="lg" mb={4}>4. プレイリストを作成</Heading>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>プレイリスト名</FormLabel>
                <Input
                  value={playlistName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPlaylistName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>説明 <Badge ml={1} colorScheme="gray">任意</Badge></FormLabel>
                <Input
                  placeholder="作成したプレイリストの説明を入力"
                  value={playlistDescription}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPlaylistDescription(e.target.value)}
                />
              </FormControl>
              <ButtonGroup>
                <Button
                  variant={isPublic ? "solid" : "outline"}
                  colorScheme="blue"
                  onClick={() => setIsPublic(true)}
                >
                  公開
                </Button>
                <Button
                  variant={!isPublic ? "solid" : "outline"}
                  colorScheme="gray"
                  onClick={() => setIsPublic(false)}
                >
                  非公開
                </Button>
              </ButtonGroup>
              <Button
                colorScheme="green"
                size="lg"
                width="full"
                onClick={handleCreatePlaylist}
                isLoading={creating}
                loadingText="作成中..."
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