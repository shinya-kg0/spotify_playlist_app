import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  Box,
  Heading,
  Icon,
  List,
  Text,
} from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";
import { useState } from 'react';
import { SortableTrackItem } from './SortableTrackItem';
import type { Track } from "../../types";

interface PlaylistTracksProps {
  tracks: Track[];
  onTracksReorder: (newTracks: Track[]) => void;
  onRemoveTrack: (track: Track) => void;
}

export function PlaylistTracks({
  tracks,
  onTracksReorder,
  onRemoveTrack,
}: PlaylistTracksProps) {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 8px移動してからドラッグ開始（誤操作防止）
        delay: 100,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: { active: any; }) {
    const { active } = event;
    const track = tracks.find(t => t.id === active.id);
    setActiveTrack(track || null);
  }

  function handleDragEnd(event: { active: any; over: any; }) {
    const { active, over } = event;
    setActiveTrack(null);

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((track) => track.id === active.id);
      const newIndex = tracks.findIndex((track) => track.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTracks = arrayMove(tracks, oldIndex, newIndex);
        onTracksReorder(newTracks);
      }
    }
  }

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
            ドラッグで曲順を変更できます。（少し長めに押し込んでください。）
          </Text>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={tracks.map(track => track.id)}
              strategy={verticalListSortingStrategy}
            >
              <List spacing={3}>
                {tracks.map((track) => (
                  <SortableTrackItem
                    key={track.id}
                    track={track}
                    onRemove={onRemoveTrack}
                  />
                ))}
              </List>
            </SortableContext>
            
            {/* ドラッグオーバーレイ - ドラッグ中の視覚フィードバック */}
            <DragOverlay>
              {activeTrack ? (
                <Box
                  p={3}
                  borderWidth={2}
                  borderColor="blue.400"
                  borderRadius="md"
                  bg="white"
                  boxShadow="lg"
                  transform="rotate(1deg)"
                  opacity={0.9}
                >
                  <Text fontWeight="bold">{activeTrack.name}</Text>
                  <Text fontSize="sm" color="gray.500">{activeTrack.artist}</Text>
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      )}
    </Box>
  );
}