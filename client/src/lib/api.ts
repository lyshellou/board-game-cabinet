import { BoardGame, LoginResponse, GameFilters, PlayRecord } from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function setToken(token: string): void {
  localStorage.setItem('admin_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('admin_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Public API
export async function fetchGames(filters: GameFilters = {}): Promise<BoardGame[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.players) params.set('players', String(filters.players));
  if (filters.difficulty_min !== undefined) params.set('difficulty_min', String(filters.difficulty_min));
  if (filters.difficulty_max !== undefined) params.set('difficulty_max', String(filters.difficulty_max));
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  const qs = params.toString();
  return request<BoardGame[]>(`/games${qs ? `?${qs}` : ''}`);
}

export async function fetchGame(id: number): Promise<BoardGame> {
  return request<BoardGame>(`/games/${id}`);
}

export async function fetchFeatured(): Promise<BoardGame[]> {
  return request<BoardGame[]>('/games/featured');
}

// Admin API
export async function adminLogin(password: string): Promise<LoginResponse> {
  const res = await request<LoginResponse>('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  setToken(res.token);
  return res;
}

export async function adminFetchGames(): Promise<BoardGame[]> {
  return request<BoardGame[]>('/admin/games', {
    headers: authHeaders(),
  });
}

export async function adminCreateGame(formData: FormData): Promise<BoardGame> {
  return request<BoardGame>('/admin/games', {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
}

export async function adminUpdateGame(id: number, formData: FormData): Promise<BoardGame> {
  return request<BoardGame>(`/admin/games/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  });
}

export async function adminDeleteGame(id: number): Promise<void> {
  await request(`/admin/games/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function adminUploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  return request<{ url: string }>('/admin/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
}

// ===== Play Records =====

export async function fetchGameRecords(gameId: number): Promise<PlayRecord[]> {
  return request<PlayRecord[]>(`/games/${gameId}/records`);
}

export async function adminFetchRecords(gameId: number): Promise<PlayRecord[]> {
  return request<PlayRecord[]>(`/admin/records?game_id=${gameId}`, {
    headers: authHeaders(),
  });
}

export async function adminCreateRecord(data: {
  game_id: number;
  played_at: string;
  player_count: number;
  duration_minutes: number;
  score?: string;
  notes?: string;
}): Promise<PlayRecord> {
  return request<PlayRecord>('/admin/records', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function adminUpdateRecord(id: number, data: Partial<{
  game_id: number;
  played_at: string;
  player_count: number;
  duration_minutes: number;
  score: string;
  notes: string;
}>): Promise<PlayRecord> {
  return request<PlayRecord>(`/admin/records/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function adminDeleteRecord(id: number): Promise<void> {
  await request(`/admin/records/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
