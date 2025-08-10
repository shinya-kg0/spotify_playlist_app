import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { SingleTrackSearch } from "./SingleTrackSearch";
import { BulkTrackSearch } from "./BulkTrackSearch";
import type { SearchMode } from "../../types";

interface SearchSectionProps {
  // タブ関連
  searchMode: SearchMode;
  onTabChange: (mode: SearchMode) => void;
  
  // 単曲検索関連
  trackName: string;
  setTrackName: (value: string) => void;
  onSingleSearch: () => void;
  
  // まとめて検索関連
  bulkSetlist: string;
  setBulkSetlist: (value: string) => void;
  bulkLoading: boolean;
  onBulkSearch: () => void;
  
  // 共通
  artistName: string;
  setArtistName: (value: string) => void;
}

export function SearchSection({
  searchMode,
  onTabChange,
  trackName,
  setTrackName,
  onSingleSearch,
  bulkSetlist,
  setBulkSetlist,
  bulkLoading,
  onBulkSearch,
  artistName,
  setArtistName,
}: SearchSectionProps) {
  const handleTabsChange = (index: number) => {
    const mode: SearchMode = index === 0 ? 'single' : 'bulk';
    onTabChange(mode);
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
      <Heading as="h2" size="lg" mb={4}>曲を検索</Heading>
      
      <Tabs 
        index={searchMode === 'single' ? 0 : 1} 
        onChange={handleTabsChange}
        colorScheme="teal"
      >
        <TabList>
          <Tab>単曲検索</Tab>
          <Tab>まとめて検索</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <SingleTrackSearch
              trackName={trackName}
              setTrackName={setTrackName}
              artistName={artistName}
              setArtistName={setArtistName}
              onSearch={onSingleSearch}
            />
          </TabPanel>
          
          <TabPanel px={0}>
            <BulkTrackSearch
              artistName={artistName}
              setArtistName={setArtistName}
              bulkSetlist={bulkSetlist}
              setBulkSetlist={setBulkSetlist}
              bulkLoading={bulkLoading}
              onBulkSearch={onBulkSearch}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}