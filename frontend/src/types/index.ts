export interface UserProfile {
  id: string;
  display_name: string;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  uri: string;
}

export interface PlaylistFormData {
  name: string;
  description: string;
  isPublic: boolean;
}