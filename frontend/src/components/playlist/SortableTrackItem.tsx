import {
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS
} from '@dnd-kit/utilities';
import {
  Box,
  Button,
  HStack,
  Icon,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";
import type { Track } from "../../types";

interface SortableTrackItemProps {
  track: Track;
  onRemove: (track: Track) => void;
}

export function SortableTrackItem({
  track,
  onRemove,
}: SortableTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: track.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      p={3}
      borderWidth={1}
      borderRadius="md"
      _hover={{ bg: "gray.50" }}
      cursor={isDragging ? "grabbing" : "grab"}
      bg={isDragging ? "blue.50" : "white"}
      borderColor={isDragging ? "blue.300" : "gray.200"}
      boxShadow={isDragging ? "md" : "none"}
      transform={isDragging ? "rotate(2deg)" : "none"}
    >
      <HStack spacing={3}>
        {/* ドラッグハンドル */}
        <Icon
          as={DragHandleIcon}
          color="gray.400"
          _hover={{ color: "gray.600" }}
          cursor="grab"
          _active={{ cursor: "grabbing" }}
          {...attributes}
          {...listeners}
          // アクセシビリティ対応
          aria-label={`${track.name}の順序を変更`}
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
          aria-label={`${track.name}をプレイリストから削除`}
        >
          削除
        </Button>
      </HStack>
    </ListItem>
  );
}