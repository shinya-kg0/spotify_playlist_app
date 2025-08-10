import {
  Box,
  Button,
  Heading,
  HStack,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import type { Track } from "../../types";

interface SearchResultsProps {
  tracks: Track[];
  onAddTrack: (track: Track) => void;
}

export function SearchResults({ tracks, onAddTrack }: SearchResultsProps) {
  return (
    <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" w="100%">
      <Heading as="h2" size="lg" mb={4}> 検索結果</Heading>
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
                  onClick={() => onAddTrack(track)}
                >
                  追加
                </Button>
              </HStack>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}