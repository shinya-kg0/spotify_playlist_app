import { type ChangeEvent } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Text,
} from "@chakra-ui/react";

interface BulkTrackSearchProps {
  artistName: string;
  setArtistName: (value: string) => void;
  bulkSetlist: string;
  setBulkSetlist: (value: string) => void;
  bulkLoading: boolean;
  onBulkSearch: () => void;
}

export function BulkTrackSearch({
  artistName,
  setArtistName,
  bulkSetlist,
  setBulkSetlist,
  bulkLoading,
  onBulkSearch,
}: BulkTrackSearchProps) {
  return (
    <VStack spacing={4}>
      <FormControl isRequired>
        <FormLabel>アーティスト名</FormLabel>
        <Input
          placeholder="THE ORAL CIGARETTES"
          value={artistName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setArtistName(e.target.value)}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>セットリスト</FormLabel>
        <Textarea
          placeholder={`1. もういいかい？
2. 5150
3. モンスターエフェクト
4. ENEMY
5. BAG
6. PSYCHOPATH`}
          value={bulkSetlist}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBulkSetlist(e.target.value)}
          rows={8}
          resize="vertical"
        />
        <Text fontSize="sm" color="gray.600" mt={1}>
          改行区切りで曲名を入力してください。番号は自動で除去されます。
        </Text>
      </FormControl>
      <Button
        colorScheme="teal"
        width="full"
        onClick={onBulkSearch}
        isLoading={bulkLoading}
        loadingText="検索中..."
      >
        一括検索する
      </Button>
    </VStack>
  );
}