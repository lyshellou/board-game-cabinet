import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'board-game-cabinet-secret-key-2026';

export interface AuthRequest extends Request {
  admin?: { username: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未提供认证令牌' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { username: string };
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: '认证令牌无效或已过期' });
  }
}
