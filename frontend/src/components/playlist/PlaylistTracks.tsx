import {
  Box,
  Heading,
  Icon,
  List,
  Text,
} from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";
import { DraggableTrackItem } from "./DraggableTrackItem";
import type { Track } from "../../types";

interface PlaylistTracksProps {
  tracks: Track[];
  onRemoveTrack: (track: Track) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnter: (index: number) => void;
  onDragLeave: () => void;
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

export function PlaylistTracks({
  tracks,
  onRemoveTrack,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  draggedIndex,
  dragOverIndex,
}: PlaylistTracksProps) {
  return (
    <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" w="100%">
      <Heading as="h2" size="lg" mb={4}>
        プレイリストの曲
      </Heading>
      {tracks.length === 0 ? (
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
            {tracks.map((track, index) => (
              <DraggableTrackItem
                key={track.id}
                track={track}
                index={index}
                onRemove={onRemoveTrack}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                isDragging={draggedIndex === index}
                showInsertLine={dragOverIndex === index && draggedIndex !== index}
              />
            ))}
          </List>
        </>
      )}
    </Box>
  );
}