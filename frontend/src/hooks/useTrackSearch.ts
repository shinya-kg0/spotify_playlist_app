import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import type { Track } from "../types";

export function useTrackSearch() {
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSearch = async () => {
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

      const res = await fetch(`/api/playlist/search?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTracks(data);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "検索に失敗しました。");
      }
    } catch (err) {
      setError("検索中にエラーが発生しました。");
      console.error("Failed to search track:", err);
    }
  };

  const clearSearch = () => {
    setTrackName("");
    setArtistName("");
    setTracks([]);
    setError(null);
  };

  return {
    trackName,
    setTrackName,
    artistName,
    setArtistName,
    tracks,
    error,
    handleSearch,
    clearSearch,
  };
}