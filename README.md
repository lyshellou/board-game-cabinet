# Board Game Cabinet·桌面游戏珍藏柜

一款个人桌游收藏展示与管理工具。精选每一款桌游，记录它们的魅力——从策略深度到聚会欢笑，从两人对弈到众乐时光。

![Board Game Cabinet](./screenshot.png)

## 功能特性

- **精品展示** — 首页精选推荐，按评分展示最受欢迎的桌游
- **完整画廊** — 浏览全部收藏，支持多维度筛选与搜索
- **游戏详情** — 每款游戏独立页面，展示人数、时长、难度、评分、玩法介绍与个人评价
- **分类导航** — 按策略、聚会、合作、抽象、角色扮演等类型快速探索
- **后台管理** — 管理员登录后可在线上传游戏封面、新增/编辑/删除桌游数据

## 技术栈

| 层级   | 技术                          |
|--------|-------------------------------|
| 前端   | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| 后端   | Node.js, Express, TypeScript  |
| 数据库 | SQLite（Node 原生 `node:sqlite`） |
| 认证   | JWT                           |
| 图标   | Lucide Icons                  |

## 快速开始

### 环境要求

- Node.js ≥ 22（需支持 `--experimental-sqlite` 标志）

### 安装与运行

```bash
# 克隆项目
git clone <your-repo-url>
cd board-game-cabinet

# 安装客户端依赖
cd client && npm install

# 安装服务端依赖
cd ../server && npm install
cd ..

# 初始化数据库（插入 10 款示例桌游）
npm run seed

# 启动开发环境（前后端同时启动）
npm run dev
```

服务端默认运行在 `http://localhost:3001`，前端开发服务器为 `http://localhost:5173`。

### 生产构建

```bash
npm run build   # 构建前端
npm start       # 启动生产服务（单一 Express 进程托管 API + 前端静态文件）
```

## 后台管理

访问 `/admin` 进入管理后台。

- 默认管理员密码：`admin123`（可在 `.env` 中修改 `ADMIN_PASSWORD`）
- 登录后可新增、编辑、删除桌游，支持上传游戏封面图片

## 环境变量

在项目根目录创建 `.env` 文件：

```env
PORT=3001
ADMIN_PASSWORD=admin123
JWT_SECRET=board-game-cabinet-secret-key-2026
```

## 项目结构

```
board-game-cabinet/
├── client/                # React 前端
│   └── src/
│       ├── pages/         # HomePage, GalleryPage, GamePage, AdminPage
│       ├── components/    # GameCard, GameGrid, FilterBar, Layout, Header, Footer
│       ├── hooks/         # useGames, useGame
│       ├── lib/           # API 客户端
│       └── types/         # TypeScript 类型定义
├── server/                # Express 后端
│   └── src/
│       ├── db/            # 数据库 Schema, 查询, 种子数据
│       ├── middleware/    # JWT 认证, 文件上传
│       └── routes/        # API 路由（公共 + 管理）
└── package.json           # 根级启动脚本
```

## 示例桌游数据

项目内置 10 款经典桌游的种子数据：

- 卡坦岛 · 璀璨宝石 · 谍报风云 · 瘟疫危机
- 七大奇迹 · 阿瓦隆 · 展翅翱翔 · 花砖物语
- 幽港迷城 · 情书

运行 `npm run seed` 即可初始化这些数据（会清空已有数据并重新插入）。

## License

MIT
