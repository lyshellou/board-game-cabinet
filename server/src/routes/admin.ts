import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getAllGames, getGameById, createGame, updateGame, deleteGame } from '../db/queries.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'board-game-cabinet-secret-key-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function parseCategoryBody(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return raw ? [raw] : [];
    }
  }
  return [];
}

// 登录
router.post('/login', (req: AuthRequest, res: Response) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: '密码错误' });
    return;
  }
  const token = jwt.sign({ username: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// 以下接口均需认证
router.use(authMiddleware);

router.get('/games', (_req: AuthRequest, res: Response) => {
  const games = getAllGames();
  res.json(games);
});

router.post('/games', upload.single('image'), (req: AuthRequest, res: Response) => {
  const body = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : (body.image || '');
  const cover_image = body.cover_image || '';
  const game = createGame({
    name: body.name,
    name_en: body.name_en,
    image,
    cover_image,
    description: body.description,
    player_count_min: body.player_count_min ? Number(body.player_count_min) : undefined,
    player_count_max: body.player_count_max ? Number(body.player_count_max) : undefined,
    duration_per_player: body.duration_per_player ? Number(body.duration_per_player) : undefined,
    difficulty: body.difficulty ? Number(body.difficulty) : undefined,
    rating: body.rating ? Number(body.rating) : undefined,
    review: body.review,
    category: parseCategoryBody(body.category),
    published_year: body.published_year ? Number(body.published_year) : undefined,
  });
  res.status(201).json(game);
});

router.put('/games/:id', upload.single('image'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: '无效的游戏 ID' });
    return;
  }
  const existing = getGameById(id);
  if (!existing) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }
  const body = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : (body.image || undefined);
  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.name_en !== undefined) updateData.name_en = body.name_en;
  if (image !== undefined) updateData.image = image;
  if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.player_count_min !== undefined) updateData.player_count_min = Number(body.player_count_min);
  if (body.player_count_max !== undefined) updateData.player_count_max = Number(body.player_count_max);
  if (body.duration_per_player !== undefined) updateData.duration_per_player = Number(body.duration_per_player);
  if (body.difficulty !== undefined) updateData.difficulty = Number(body.difficulty);
  if (body.rating !== undefined) updateData.rating = Number(body.rating);
  if (body.review !== undefined) updateData.review = body.review;
  if (body.category !== undefined) updateData.category = parseCategoryBody(body.category);
  if (body.published_year !== undefined) updateData.published_year = Number(body.published_year);

  const updated = updateGame(id, updateData);
  res.json(updated);
});

router.delete('/games/:id', (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: '无效的游戏 ID' });
    return;
  }
  const success = deleteGame(id);
  if (!success) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }
  res.json({ success: true });
});

// 独立图片上传
router.post('/upload', upload.single('image'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: '未提供图片' });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
