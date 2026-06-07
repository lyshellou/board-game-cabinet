# Board Game Cabinet — Agent Reference

## Overview

Board Game Cabinet is a full-stack monorepo for managing and displaying a personal board game collection. It consists of an Express + SQLite backend and a React + Vite frontend.

## Project Layout

```
board-game-cabinet/
├── package.json          # Root scripts (dev, build, seed)
├── client/               # React SPA (Vite + Tailwind + TypeScript)
│   ├── src/
│   │   ├── App.tsx               # React Router route definitions
│   │   ├── main.tsx              # Entry point
│   │   ├── types/index.ts        # BoardGame, BoardGameInput, GameFilters, LoginRequest
│   │   ├── lib/api.ts            # API client (public + admin endpoints)
│   │   ├── hooks/                # useGames(filters), useGame(id)
│   │   ├── pages/                # HomePage, GalleryPage, GamePage, AdminPage
│   │   └── components/
│   │       ├── layout/           # Layout, Header, Footer
│   │       ├── game/             # GameCard, GameGrid
│   │       └── filters/          # FilterBar
│   └── vite.config.ts           # Dev proxy: /api → :3001, /uploads → :3001
└── server/               # Express API (TypeScript, tsx, node --experimental-sqlite)
    ├── src/
    │   ├── index.ts              # Express app setup, static serving, initDb()
    │   ├── db/
    │   │   ├── schema.ts         # SQLite init (board_games table), getDb()
    │   │   ├── queries.ts        # CRUD + filtering + featured (parametrized queries)
    │   │   └── seed.ts           # 10 sample board games (Chinese + English)
    │   ├── middleware/
    │   │   ├── auth.ts           # JWT Bearer verification (authMiddleware)
    │   │   └── upload.ts         # Multer config (disk storage, UUID filenames, 10MB limit)
    │   └── routes/
    │       ├── games.ts          # GET /api/games, /api/games/featured, /api/games/:id
    │       └── admin.ts          # POST login, full CRUD (protected), POST upload
    └── public/uploads/           # Uploaded images (UUID-named, .gitkeep present)
```

## Data Model

### board_games table (SQLite)

| Column              | Type    | Default      | Notes                     |
|---------------------|---------|--------------|---------------------------|
| id                  | INTEGER | auto         | PRIMARY KEY               |
| name                | TEXT    | NOT NULL     | Chinese name              |
| name_en             | TEXT    | ''           | English name              |
| image               | TEXT    | ''           | Image path (/uploads/...) |
| description         | TEXT    | ''           | Gameplay description      |
| player_count_min    | INTEGER | 1            |                           |
| player_count_max    | INTEGER | 4            |                           |
| duration_per_player | INTEGER | 30           | Minutes per player        |
| difficulty          | REAL    | 2.0          | 0.0–5.0 scale             |
| rating              | REAL    | 5.0          | 0.0–10.0 scale            |
| review              | TEXT    | ''           | Personal review           |
| category            | TEXT    | ''           | Genre tag e.g. 策略, 聚会  |
| published_year      | INTEGER | 2020         |                           |
| created_at          | TEXT    | datetime('now') | Auto timestamp        |

### TypeScript interface (shared shape, defined independently in client + server)

```typescript
interface BoardGame {
  id: number; name: string; name_en: string; image: string;
  description: string; player_count_min: number; player_count_max: number;
  duration_per_player: number; difficulty: number; rating: number;
  review: string; category: string; published_year: number; created_at: string;
}
```

## API Endpoints

### Public (no auth)

| Method | Path                  | Query Params                                  | Description            |
|--------|-----------------------|-----------------------------------------------|------------------------|
| GET    | /api/games            | category, players, difficulty_min, difficulty_max, search, sort | Filtered list |
| GET    | /api/games/featured   | —                                             | Top 4 by rating        |
| GET    | /api/games/:id        | —                                             | Single game by ID      |

Valid `sort` values: `rating` (default), `year`, `name`, `difficulty`.

### Admin (JWT required)

| Method | Path                  | Body / Params           | Description            |
|--------|-----------------------|-------------------------|------------------------|
| POST   | /api/admin/login      | `{ password }`          | Returns `{ token }`    |
| GET    | /api/admin/games      | —                       | List all (unfiltered)  |
| POST   | /api/admin/games      | FormData (multipart)    | Create game            |
| PUT    | /api/admin/games/:id  | FormData (multipart)    | Update game            |
| DELETE | /api/admin/games/:id  | —                       | Delete game            |
| POST   | /api/admin/upload     | FormData (`image` file) | Upload image → `{url}` |

Auth header: `Authorization: Bearer <token>`. Token expires in 24 hours.

## Frontend Architecture

- **Framework:** React 18 with react-router-dom v6
- **Styling:** Tailwind CSS 3 with a dark theme (CSS custom properties for colors)
- **Icons:** lucide-react
- **State:** Component-local state + custom hooks (`useGames`, `useGame`). No global store.
- **Routing:** 4 pages — Home (`/`), Gallery (`/gallery`), Game detail (`/game/:id`), Admin (`/admin`)

### Page Responsibilities

- **HomePage:** Hero section, featured games grid (4 cards), category exploration links.
- **GalleryPage:** Full game grid with FilterBar (category chips, player slider 0–10, difficulty range sliders). Reads query params for pre-seeded filters.
- **GamePage:** Single game detail with image, stat cards, difficulty dots, star rating, description, and personal review blockquote.
- **AdminPage:** Two views — login form (if no token) and management table with modal CRUD form. Supports image upload via dedicated endpoint.

## Running the Project

```bash
# Install both client and server dependencies
cd client && npm install
cd ../server && npm install

# Seed the database with sample data
npm run seed

# Start dev (concurrent server + client)
npm run dev

# Build for production
npm run build
npm start
```

- Dev server runs on port 3001 by default (configurable via `PORT` env var)
- Vite dev server on port 5173 with proxy to 3001
- Database file: `server/data.db` (WAL mode, auto-created)

## Environment Variables

| Variable         | Default                               | Description       |
|------------------|---------------------------------------|-------------------|
| PORT             | 3001                                  | Server port       |
| ADMIN_PASSWORD   | admin123                              | Admin login       |
| JWT_SECRET       | board-game-cabinet-secret-key-2026    | JWT signing key   |

## Key Design Decisions

- **SQLite** via Node's built-in `node:sqlite` (`--experimental-sqlite` flag required). No ORM — raw SQL with parameterized queries.
- **tsx** for TypeScript execution without a build step during development.
- **Production static serving:** The Express server serves the built client `dist/` folder, so a single process handles both API and frontend.
- **Image uploads:** Stored on disk under `server/public/uploads/` with UUID filenames. Served statically at `/uploads/`. Only JPG/PNG/WebP/GIF accepted, max 10MB.
- **No client-side routing for admin auth:** Admin token stored in `localStorage`. Login form rendered conditionally based on token presence.
- **Seed data language:** All seed data uses Chinese with English name fields.

## Git Ignored Files

- `node_modules/`, `dist/`, `.env`, `*.db`, `uploads/*` (except `.gitkeep`)
