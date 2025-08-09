import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  Center,
  Heading,
  HStack,
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
    trackName,
    setTrackName,
    artistName,
    setArtistName,
    tracks,
    error: searchError,
    handleSearch,
  } = useTrackSearch();

  const {
    playlistTracks,
    formData,
    setFormData,
    creating,
    draggedIndex,
    dragOverIndex,
    addToPlaylist,
    removeFromPlaylist,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    createPlaylist,
  } = usePlaylist();

  const error = authError || searchError;

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
          trackName={trackName}
          setTrackName={setTrackName}
          artistName={artistName}
          setArtistName={setArtistName}
          onSearch={handleSearch}
        />

        {/* 2. 検索結果 & 3. プレイリストの曲 */}
        <HStack spacing={8} align="start">
          <SearchResults tracks={tracks} onAddTrack={addToPlaylist} />
          
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
        </HStack>

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