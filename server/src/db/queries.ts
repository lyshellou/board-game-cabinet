import { getDb } from './schema.js';

export interface BoardGameRow {
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

export interface GameFilters {
  category?: string;
  players?: number;
  difficulty_min?: number;
  difficulty_max?: number;
  search?: string;
  sort?: string;
}

export function getAllGames(filters: GameFilters = {}): BoardGameRow[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.category) {
    conditions.push('category = @category');
    params.category = filters.category;
  }
  if (filters.players !== undefined && filters.players > 0) {
    conditions.push('player_count_min <= @players AND player_count_max >= @players');
    params.players = filters.players;
  }
  if (filters.difficulty_min !== undefined) {
    conditions.push('difficulty >= @difficulty_min');
    params.difficulty_min = filters.difficulty_min;
  }
  if (filters.difficulty_max !== undefined) {
    conditions.push('difficulty <= @difficulty_max');
    params.difficulty_max = filters.difficulty_max;
  }
  if (filters.search) {
    conditions.push('(name LIKE @search OR name_en LIKE @search OR description LIKE @search)');
    params.search = `%${filters.search}%`;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY rating DESC';
  if (filters.sort === 'year') orderBy = 'ORDER BY published_year DESC';
  if (filters.sort === 'name') orderBy = 'ORDER BY name ASC';
  if (filters.sort === 'difficulty') orderBy = 'ORDER BY difficulty ASC';

  const stmt = db.prepare(`SELECT * FROM board_games ${where} ${orderBy}`);
  return stmt.all(params) as BoardGameRow[];
}

export function getGameById(id: number): BoardGameRow | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM board_games WHERE id = ?');
  return stmt.get(id) as BoardGameRow | undefined;
}

export function getFeaturedGames(): BoardGameRow[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM board_games ORDER BY rating DESC LIMIT 4');
  return stmt.all() as BoardGameRow[];
}

export interface CreateGameInput {
  name: string;
  name_en?: string;
  image?: string;
  cover_image?: string;
  description?: string;
  player_count_min?: number;
  player_count_max?: number;
  duration_per_player?: number;
  difficulty?: number;
  rating?: number;
  review?: string;
  category?: string;
  published_year?: number;
}

export function createGame(input: CreateGameInput): BoardGameRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO board_games (name, name_en, image, cover_image, description, player_count_min, player_count_max, duration_per_player, difficulty, rating, review, category, published_year)
    VALUES (@name, @name_en, @image, @cover_image, @description, @player_count_min, @player_count_max, @duration_per_player, @difficulty, @rating, @review, @category, @published_year)
  `);
  const result = stmt.run({
    name: input.name,
    name_en: input.name_en ?? '',
    image: input.image ?? '',
    cover_image: input.cover_image ?? '',
    description: input.description ?? '',
    player_count_min: input.player_count_min ?? 1,
    player_count_max: input.player_count_max ?? 4,
    duration_per_player: input.duration_per_player ?? 30,
    difficulty: input.difficulty ?? 2.0,
    rating: input.rating ?? 5.0,
    review: input.review ?? '',
    category: input.category ?? '',
    published_year: input.published_year ?? 2020,
  });
  return getGameById(Number(result.lastInsertRowid))!;
}

export function updateGame(id: number, input: Partial<CreateGameInput>): BoardGameRow | undefined {
  const db = getDb();
  const existing = getGameById(id);
  if (!existing) return undefined;

  const merged = {
    name: input.name ?? existing.name,
    name_en: input.name_en ?? existing.name_en,
    image: input.image ?? existing.image,
    cover_image: input.cover_image ?? existing.cover_image,
    description: input.description ?? existing.description,
    player_count_min: input.player_count_min ?? existing.player_count_min,
    player_count_max: input.player_count_max ?? existing.player_count_max,
    duration_per_player: input.duration_per_player ?? existing.duration_per_player,
    difficulty: input.difficulty ?? existing.difficulty,
    rating: input.rating ?? existing.rating,
    review: input.review ?? existing.review,
    category: input.category ?? existing.category,
    published_year: input.published_year ?? existing.published_year,
  };

  const stmt = db.prepare(`
    UPDATE board_games SET
      name = @name, name_en = @name_en, image = @image, cover_image = @cover_image, description = @description,
      player_count_min = @player_count_min, player_count_max = @player_count_max,
      duration_per_player = @duration_per_player, difficulty = @difficulty,
      rating = @rating, review = @review, category = @category, published_year = @published_year
    WHERE id = @id
  `);
  stmt.run({ ...merged, id });
  return getGameById(id);
}

export function deleteGame(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM board_games WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
