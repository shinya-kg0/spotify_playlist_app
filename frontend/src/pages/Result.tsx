import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Heading,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CheckCircleIcon, ExternalLinkIcon } from "@chakra-ui/icons";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  // stateからplaylistUrlを取得します。
  const playlistUrl = location.state?.playlistUrl;

  useEffect(() => {
    // URLが渡されていない場合（直接アクセスなど）は、作成ページにリダイレクトします。
    if (!playlistUrl) {
      navigate("/setlist");
    }
  }, [playlistUrl, navigate]);

  // リダイレクト中は何も表示しない
  if (!playlistUrl) {
    return null;
  }

  return (
    <Center h="100vh">
      <Box
        w={"90vw"}
        p={10}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="xl"
        textAlign="center"
      >
        <VStack spacing={6}>
          <CheckCircleIcon w={16} h={16} color="green.400" />
          <Heading as="h1" size="xl">
            プレイリストが作成されました！
          </Heading>
          <Text fontSize="lg" color="gray.600">
            以下のボタンからSpotifyで確認できます。
          </Text>
          <Link href={playlistUrl} isExternal _hover={{ textDecoration: "none" }}>
            <Button colorScheme="green" size="lg" rightIcon={<ExternalLinkIcon />}>
              Spotifyでプレイリストを開く
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => navigate("/setlist")}>
            新しいプレイリストを作成する
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}

export default Result;
