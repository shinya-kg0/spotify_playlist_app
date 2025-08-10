import { type ChangeEvent } from "react";
import {
  Box,
  Badge,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import type { PlaylistFormData } from "../../types";

interface PlaylistFormProps {
  formData: PlaylistFormData;
  onFormDataChange: (data: PlaylistFormData) => void;
  trackCount: number;
  creating: boolean;
  onCreatePlaylist: () => void;
}

export function PlaylistForm({
  formData,
  onFormDataChange,
  trackCount,
  creating,
  onCreatePlaylist,
}: PlaylistFormProps) {
  const handleInputChange = (field: keyof PlaylistFormData) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    onFormDataChange({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handlePublicChange = (isPublic: boolean) => {
    onFormDataChange({
      ...formData,
      isPublic,
    });
  };

  if (trackCount === 0) {
    return null;
  }

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
      <Heading as="h2" size="lg" mb={4}> プレイリストを作成</Heading>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>プレイリスト名</FormLabel>
          <Input
            value={formData.name}
            onChange={handleInputChange('name')}
          />
        </FormControl>
        <FormControl>
          <FormLabel>説明 <Badge ml={1} colorScheme="gray">任意</Badge></FormLabel>
          <Input
            placeholder="作成したプレイリストの説明を入力"
            value={formData.description}
            onChange={handleInputChange('description')}
          />
        </FormControl>
        <ButtonGroup>
          <Button
            variant={formData.isPublic ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => handlePublicChange(true)}
          >
            公開
          </Button>
          <Button
            variant={!formData.isPublic ? "solid" : "outline"}
            colorScheme="gray"
            onClick={() => handlePublicChange(false)}
          >
            非公開
          </Button>
        </ButtonGroup>
        <Button
          colorScheme="teal"
          size="lg"
          width="100%"
          onClick={onCreatePlaylist}
          isLoading={creating}
          loadingText="作成中..."
        >
          プレイリストを作成する
        </Button>
      </VStack>
    </Box>
  );
}