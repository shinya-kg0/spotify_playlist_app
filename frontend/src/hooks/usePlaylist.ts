import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { playlistAPI } from "../utils/apiClient";
import type { Track, PlaylistFormData } from "../types";
import { useNavigate } from "react-router-dom";

export function usePlaylist() {
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: "My Playlist",
    description: "",
    isPublic: false,
  });
  const [creating, setCreating] = useState(false);
  
  // ドラッグ&ドロップの状態管理
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverTimeout, setDragOverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  const toast = useToast();
  const navigate = useNavigate();

  // 単曲を追加する処理
  const addToPlaylist = (track: Track) => {
    if (!playlistTracks.some(t => t.id === track.id)) {
      setPlaylistTracks([...playlistTracks, track]);
      toast({
        title: "曲を追加しました",
        description: `${track.name} - ${track.artist}`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } else {
      toast({
        title: "この曲は既に追加されています",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // 複数曲を追加する処理（まとめて検索用）
  const addMultipleToPlaylist = (tracks: Track[]) => {
    const newTracks: Track[] = [];
    const duplicateTracks: Track[] = [];

    tracks.forEach(track => {
      if (!playlistTracks.some(t => t.id === track.id)) {
        newTracks.push(track);
      } else {
        duplicateTracks.push(track);
      }
    });

    if (newTracks.length > 0) {
      setPlaylistTracks(prev => [...prev, ...newTracks]);
    }

    if (duplicateTracks.length > 0) {
      toast({
        title: `${duplicateTracks.length}曲は既に追加済みです`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // 曲を削除する処理
  const removeFromPlaylist = (track: Track) => {
    // ドラッグ関連の状態をクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
      setDragOverTimeout(null);
    }
    setDragOverIndex(null);
    setDraggedIndex(null);
    
    setPlaylistTracks(playlistTracks.filter(t => t.id !== track.id));
    toast({
      title: "曲を削除しました",
      description: `${track.name} - ${track.artist}`,
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top",
    });
  };

  // ドラッグ開始時の処理
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  // ドラッグオーバー時の処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // ドロップ時の処理
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    // タイムアウトをクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
      setDragOverTimeout(null);
    }
    setDragOverIndex(null);
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newTracks = [...playlistTracks];
    const draggedTrack = newTracks[draggedIndex];
    
    // 元の位置から削除
    newTracks.splice(draggedIndex, 1);
    
    // 新しい位置に挿入
    newTracks.splice(dropIndex, 0, draggedTrack);
    
    setPlaylistTracks(newTracks);
    setDraggedIndex(null);
  };

  // ドラッグエンター時の処理（ディレイ付き）
  const handleDragEnter = (index: number) => {
    // 既存のタイムアウトをクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
    }
    
    // 200msのディレイでハイライト表示
    const timeout = setTimeout(() => {
      setDragOverIndex(index);
    }, 200);
    
    setDragOverTimeout(timeout);
  };

  // ドラッグリーブ時の処理
  const handleDragLeave = () => {
    // タイムアウトをクリア
    if (dragOverTimeout) {
      clearTimeout(dragOverTimeout);
      setDragOverTimeout(null);
    }
    setDragOverIndex(null);
  };

  // プレイリスト作成処理
  const createPlaylist = async () => {
    if (playlistTracks.length === 0) {
      toast({
        title: "プレイリストに曲が追加されていません",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return false;
    }

    setCreating(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        public: formData.isPublic,
        track_uris: playlistTracks.map(track => track.uri),
      };

      const res = await playlistAPI.createPlaylist(payload);

      if (res.ok) {
        const createdPlaylist = await res.json();
        toast({
          title: "プレイリストを作成しました！",
          description: `${createdPlaylist.name} (${createdPlaylist.track_count}曲)`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        
        // フォームをリセット
        setPlaylistTracks([]);
        setFormData({
          name: "My Playlist",
          description: "",
          isPublic: false,
        });
        // Result へ state 経由でプレイリストURLを渡す
        const playlistUrl =
          createdPlaylist?.external_urls?.spotify ??
          (createdPlaylist?.id ? `https://open.spotify.com/playlist/${createdPlaylist.id}` : "");
        navigate("/result", { state: { playlistUrl } });
        return true;
      } else {
        const errorData = await res.json();
        toast({
          title: "プレイリストの作成に失敗しました",
          description: errorData.detail || "不明なエラーが発生しました",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        return false;
      }
    } catch (err) {
      toast({
        title: "プレイリスト作成中にエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.error("Failed to create playlist:", err);
      return false;
    } finally {
      setCreating(false);
    }
  };

  return {
    playlistTracks,
    formData,
    setFormData,
    creating,
    draggedIndex,
    dragOverIndex,
    addToPlaylist,
    addMultipleToPlaylist,
    removeFromPlaylist,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    createPlaylist,
  };
}