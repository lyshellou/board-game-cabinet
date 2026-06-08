# Board Game Cabinet · 桌面游戏珍藏柜

一个精致的个人桌游收藏展示网站。精选你的每一款桌游，记录它们的独特魅力——从策略深度到聚会欢笑，从两人对弈到众乐时光。

## 页面一览

- **首页** — 精选推荐高评分桌游，按分类快速探索
- **画廊** — 浏览全部收藏，支持按分类、人数、难度、关键词筛选
- **详情** — 每款游戏的独立页面，展示人数、时长、难度、评分、玩法介绍和个人评价
- **后台** — 管理员登录后可新增、编辑、删除桌游，支持上传封面图片

## 快速启动

需要 [Node.js](https://nodejs.org/) ≥ 22。

```bash
# 安装依赖
cd client && npm install
cd ../server && npm install
cd ..
npm install

# 导入 10 款示例桌游
npm run seed

# 启动开发环境
npm run dev
```

访问 `http://localhost:5173` 即可看到网站。

## 生产部署

```bash
npm run build   # 构建前端
npm start       # 启动服务（API + 前端一体化）
```

## 后台管理

访问 `/admin`，默认密码 `admin123`。登录后可管理全部桌游数据。

## 配置

在项目根目录创建 `.env`：

```env
PORT=3001
ADMIN_PASSWORD=admin123
JWT_SECRET=your-secret-key
```

## 技术栈

React 18 + TypeScript + Vite + Tailwind CSS · Node.js + Express + TypeScript · SQLite · JWT

## License

MIT
