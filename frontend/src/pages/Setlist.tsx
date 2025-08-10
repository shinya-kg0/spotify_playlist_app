import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  Center,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { useTrackSearch } from "../hooks/useTrackSearch";
import { usePlaylist } from "../hooks/usePlaylist";
import { SearchSection } from "../components/playlist/SearchSection";
import { SearchResults } from "../components/playlist/SearchResults";
import { PlaylistTracks } from "../components/playlist/PlaylistTracks";
import { PlaylistForm } from "../components/playlist/PlaylistForm";

function Setlist() {
  const { user, loading, error: authError } = useAuth();
  
  const {
    // タブ関連
    searchMode,
    handleTabChange,
    
    // 単曲検索関連
    trackName,
    setTrackName,
    tracks,
    handleSingleSearch,
    
    // まとめて検索関連
    bulkSetlist,
    setBulkSetlist,
    bulkLoading,
    handleBulkSearch,
    
    // 共通
    artistName,
    setArtistName,
    error: searchError,
  } = useTrackSearch();

  const {
    playlistTracks,
    formData,
    setFormData,
    creating,
    draggedIndex,
    dragOverIndex,
    addToPlaylist,
    addMultipleToPlaylist,
    removeFromPlaylist,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    createPlaylist,
  } = usePlaylist();

  const error = authError || searchError;

  // まとめて検索のハンドラー
  const handleBulkSearchWithPlaylist = () => {
    handleBulkSearch(addMultipleToPlaylist);
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
          {user && (
            <Text textAlign="center" color="gray.500">
              ようこそ, {user.display_name} さん！
            </Text>
          )}
          {error && (
            <Alert status="error" mt={4} borderRadius="md">
              <AlertIcon />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </Box>

        {/* 1. 曲を検索 */}
        <SearchSection
          searchMode={searchMode}
          onTabChange={handleTabChange}
          trackName={trackName}
          setTrackName={setTrackName}
          onSingleSearch={handleSingleSearch}
          bulkSetlist={bulkSetlist}
          setBulkSetlist={setBulkSetlist}
          bulkLoading={bulkLoading}
          onBulkSearch={handleBulkSearchWithPlaylist}
          artistName={artistName}
          setArtistName={setArtistName}
        />

        {/* 2. 検索結果 & 3. プレイリストの曲 */}
          {searchMode === "single" && (
            <SearchResults tracks={tracks} onAddTrack={addToPlaylist} />
          )}
          <PlaylistTracks
            tracks={playlistTracks}
            onRemoveTrack={removeFromPlaylist}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            draggedIndex={draggedIndex}
            dragOverIndex={dragOverIndex}
          />

        {/* 4. プレイリスト作成設定 */}
        <PlaylistForm
          formData={formData}
          onFormDataChange={setFormData}
          trackCount={playlistTracks.length}
          creating={creating}
          onCreatePlaylist={createPlaylist}
        />
      </VStack>
    </Box>
  );
}

export default Setlist;