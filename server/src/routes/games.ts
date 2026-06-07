import { Router, Request, Response } from 'express';
import { getAllGames, getGameById, getFeaturedGames } from '../db/queries.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { category, players, difficulty_min, difficulty_max, search, sort } = req.query;
  const games = getAllGames({
    category: category as string | undefined,
    players: players ? Number(players) : undefined,
    difficulty_min: difficulty_min ? Number(difficulty_min) : undefined,
    difficulty_max: difficulty_max ? Number(difficulty_max) : undefined,
    search: search as string | undefined,
    sort: sort as string | undefined,
  });
  res.json(games);
});

router.get('/featured', (_req: Request, res: Response) => {
  const games = getFeaturedGames();
  res.json(games);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: '无效的游戏 ID' });
    return;
  }
  const game = getGameById(id);
  if (!game) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }
  res.json(game);
});

export default router;
