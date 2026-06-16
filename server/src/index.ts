import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db/schema.js';
import gamesRouter from './routes/games.js';
import adminRouter from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化数据库
initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件：上传的图片
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// API 路由
app.use('/api/games', gamesRouter);
app.use('/api/admin', adminRouter);

// 生产环境：托管前端构建产物
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎲 Board Game Cabinet 服务器已启动: http://localhost:${PORT}`);
});
