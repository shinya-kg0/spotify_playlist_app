import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { playlistAPI } from "../utils/apiClient";
import type { Track, TrackQuery, SearchMode } from "../types";

export function useTrackSearch() {
  // タブの状態管理
  const [searchMode, setSearchMode] = useState<SearchMode>('single');
  
  // 単曲検索用の状態
  const [trackName, setTrackName] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  
  // まとめて検索用の状態
  const [bulkSetlist, setBulkSetlist] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // 両タブで共有するアーティスト名
  const [artistName, setArtistName] = useState("");
  
  // 共通の状態
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // セットリストテキストを解析してTrackQuery[]に変換
  const parseBulkInput = (artistName: string, setlistText: string): TrackQuery[] => {
    return setlistText
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        // 番号を除去: "1." "2)" "(3)" などのパターン
        const trackName = line.replace(/^\s*\d+[\.\)\(]\s*/, '').trim();
        return {
          track_name: trackName,
          artist_name: artistName
        };
      });
  };

  // 単曲検索処理
  const handleSingleSearch = async () => {
    if (!trackName.trim()) {
      toast({
        title: "曲名を入力してください",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setError(null);

    try {
      const query = new URLSearchParams();
      query.append("track_name", trackName);
      if (artistName) query.append("artist_name", artistName);

      const res = await playlistAPI.searchTrack(query);
      if (res.ok) {
        const data = await res.json();
        setTracks(data);
        setTrackName("");
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "検索に失敗しました。");
      }
    } catch (err) {
      setError("検索中にエラーが発生しました。");
      console.error("Failed to search track:", err);
    }
  };

  // まとめて検索処理
  const handleBulkSearch = async (onAddMultipleTracks: (tracks: Track[]) => void) => {
    if (!artistName.trim()) {
      toast({
        title: "アーティスト名を入力してください",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (!bulkSetlist.trim()) {
      toast({
        title: "セットリストを入力してください",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setError(null);
    setBulkLoading(true);

    try {
      const queries = parseBulkInput(artistName, bulkSetlist);
      
      const res = await playlistAPI.searchMultipleTracks(queries);

      if (res.ok) {
        const data = await res.json();
        const foundTracks = data.found_tracks;
        const notFoundCount = data.not_found_tracks.length;
        
        if (foundTracks.length > 0) {
          onAddMultipleTracks(foundTracks);
          toast({
            title: "曲を一括追加しました",
            description: `${foundTracks.length}曲を追加しました${notFoundCount > 0 ? `（${notFoundCount}曲が見つかりませんでした）` : ''}`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          
          if (notFoundCount > 0) {
            toast({
              title: "一部の曲が見つかりませんでした",
              description: "「単曲検索」タブで個別に検索して調整してください",
              status: "info",
              duration: 8000,
              isClosable: true,
              position: "top",
            });
          }
        } else {
          toast({
            title: "曲が見つかりませんでした",
            description: "アーティスト名や曲名を確認して、「単曲検索」タブで個別に検索してください",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "検索に失敗しました。");
      }
    } catch (err) {
      setError("検索中にエラーが発生しました。");
      console.error("Failed to bulk search tracks:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  // タブ切り替え時の処理
  const handleTabChange = (newMode: SearchMode) => {
    if (newMode !== searchMode) {
      setSearchMode(newMode);
      // 単曲検索の曲名をクリア（アーティスト名は共有）
      if (newMode === 'bulk') {
        setTrackName("");
      }
      // エラー状態をクリア
      setError(null);
    }
  };

  const clearSearch = () => {
    setTrackName("");
    setArtistName("");
    setBulkSetlist("");
    setTracks([]);
    setError(null);
  };

  return {
    // タブ関連
    searchMode,
    handleTabChange,
    
    // 単曲検索関連
    trackName,
    setTrackName,
    tracks,
    handleSingleSearch,
    
    // まとめて検索関連
    bulkSetlist,
    setBulkSetlist,
    bulkLoading,
    handleBulkSearch,
    
    // 共通
    artistName,
    setArtistName,
    error,
    clearSearch,
  };
}