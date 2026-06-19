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
  category: string; // JSON array in DB
  published_year: number;
  created_at: string;
}

/** 将 DB 中的 category（JSON 字符串或旧版纯文本）解析为 string[] */
function parseCategory(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // 兼容旧数据：纯文本如 "策略"
    return raw ? [raw] : [];
  }
}

export interface GameOutput {
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
  category: string[];
  published_year: number;
  created_at: string;
}

function toOutput(row: BoardGameRow): GameOutput {
  return { ...row, category: parseCategory(row.category) };
}

export interface GameFilters {
  category?: string;
  players?: number;
  difficulty_min?: number;
  difficulty_max?: number;
  search?: string;
  sort?: string;
}

export function getAllGames(filters: GameFilters = {}): GameOutput[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.category) {
    // 匹配 JSON 数组（新数据）或旧版纯文本
    conditions.push("(category = @category OR category LIKE '%\"' || @category || '\"%')");
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
  const rows = stmt.all(params) as BoardGameRow[];
  return rows.map(toOutput);
}

export function getGameById(id: number): GameOutput | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM board_games WHERE id = ?');
  const row = stmt.get(id) as BoardGameRow | undefined;
  return row ? toOutput(row) : undefined;
}

export function getFeaturedGames(): GameOutput[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM board_games ORDER BY rating DESC LIMIT 4');
  const rows = stmt.all() as BoardGameRow[];
  return rows.map(toOutput);
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
  category?: string[];
  published_year?: number;
}

export function createGame(input: CreateGameInput): GameOutput {
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
    category: JSON.stringify(input.category ?? []),
    published_year: input.published_year ?? 2020,
  });
  return getGameById(Number(result.lastInsertRowid))!;
}

export function updateGame(id: number, input: Partial<CreateGameInput>): GameOutput | undefined {
  const db = getDb();
  const existing = getGameById(id);
  if (!existing) return undefined;

  // 从原始行获取已有的 category 字符串
  const row = db.prepare('SELECT category FROM board_games WHERE id = ?').get(id) as { category: string } | undefined;
  const existingCategoryStr = row?.category ?? '[]';

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
    category: input.category !== undefined ? JSON.stringify(input.category) : existingCategoryStr,
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
