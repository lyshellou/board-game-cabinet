export interface BoardGame {
  id: number;
  name: string;
  name_en: string;
  image: string;
  cover_image: string;
  description: string;
  player_count_min: number;
  player_count_max: number;
  duration_per_player: number;
  difficulty: number;
  rating: number;
  review: string;
  category: string;
  published_year: number;
  created_at: string;
}

export interface BoardGameInput {
  name: string;
  name_en: string;
  image: string;
  cover_image: string;
  description: string;
  player_count_min: number;
  player_count_max: number;
  duration_per_player: number;
  difficulty: number;
  rating: number;
  review: string;
  category: string;
  published_year: number;
}

export interface GameFilters {
  category?: string;
  players?: number;
  difficulty_min?: number;
  difficulty_max?: number;
  search?: string;
  sort?: string;
}

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  token: string;
}
