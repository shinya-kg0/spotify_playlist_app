import { type ChangeEvent } from "react";
import {
  Box,
  Badge,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";

interface SearchSectionProps {
  trackName: string;
  setTrackName: (value: string) => void;
  artistName: string;
  setArtistName: (value: string) => void;
  onSearch: () => void;
}

export function SearchSection({
  trackName,
  setTrackName,
  artistName,
  setArtistName,
  onSearch,
}: SearchSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
      <Heading as="h2" size="lg" mb={4}>1. 曲を検索</Heading>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>アーティスト名 <Badge ml={1} colorScheme="gray">任意</Badge></FormLabel>
          <Input
            placeholder="米津玄師"
            value={artistName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setArtistName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>曲名</FormLabel>
          <Input
            placeholder="Lemon"
            value={trackName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FormControl>
        <Button colorScheme="teal" width="full" onClick={onSearch}>検索する</Button>
      </VStack>
    </Box>
  );
}