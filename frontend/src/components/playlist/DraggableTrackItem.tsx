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

export function DraggableTrackItem({
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