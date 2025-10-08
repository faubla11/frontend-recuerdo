const API_BASE = "https://php-laravel-docker-j6so.onrender.com/api"; // Cambia esto por tu URL real

export const API_ROUTES = {
  LOGIN: `${API_BASE}/login`,
  REGISTER: `${API_BASE}/register`,
  CREATE_ALBUM: `${API_BASE}/albums`, 
  ADD_CHALLENGE: (albumId: number) => `${API_BASE}/albums/${albumId}/challenges`,
  GET_CHALLENGES: (albumId: number) => `${API_BASE}/albums/${albumId}/challenges`,
  ADD_MEMORY: (challengeId: number) => `${API_BASE}/challenges/${challengeId}/memories`,
  GET_CHALLENGE: (challengeId: number) => `${API_BASE}/challenges/${challengeId}`,
  UPDATE_CHALLENGE: (challengeId: number) => `${API_BASE}/challenges/${challengeId}`,
  DELETE_CHALLENGE: (challengeId: number) => `${API_BASE}/challenges/${challengeId}`,
  GET_ALBUMS: () => `${API_BASE}/albums`,
  GET_COMPLETED_ALBUMS: () => `${API_BASE}/albums/completed`,
  MARK_ALBUM_COMPLETED: (albumId: number) => `${API_BASE}/albums/${albumId}/complete`,
  FIND_ALBUM_BY_CODE: () => `${API_BASE}/albums/find-by-code`,
  VALIDATE_CHALLENGE: (id: number) => `${API_BASE}/challenges/${id}/validate`,
  UPDATE_ALBUM_BG_IMAGE: (albumId: number) => `${API_BASE}/albums/${albumId}/bg-image`,
  SIGN_UPLOAD: `${API_BASE}/supabase/sign-upload`,
  // Más rutas...
};