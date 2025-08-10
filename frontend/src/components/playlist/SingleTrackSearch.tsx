import { type ChangeEvent } from "react";
import {
  Badge,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";

interface SingleTrackSearchProps {
  trackName: string;
  setTrackName: (value: string) => void;
  artistName: string;
  setArtistName: (value: string) => void;
  onSearch: () => void;
}

export function SingleTrackSearch({
  trackName,
  setTrackName,
  artistName,
  setArtistName,
  onSearch,
}: SingleTrackSearchProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>アーティスト名 <Badge ml={1} colorScheme="gray">任意</Badge></FormLabel>
        <Input
          placeholder="Artist"
          value={artistName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setArtistName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>曲名</FormLabel>
        <Input
          placeholder="Track"
          value={trackName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </FormControl>
      <Button colorScheme="teal" width="full" onClick={onSearch}>検索する</Button>
    </VStack>
  );
}