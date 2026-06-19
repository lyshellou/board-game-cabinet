import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import FilterBar from '../components/filters/FilterBar';
import GameGrid from '../components/game/GameGrid';

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [players, setPlayers] = useState(0);
  const [difficultyMin, setDifficultyMin] = useState(0);
  const [difficultyMax, setDifficultyMax] = useState(5);

  const filters = useMemo(() => {
    const f: Record<string, unknown> = {};
    if (search) f.search = search;
    if (category) f.category = category;
    if (players > 0) f.players = players;
    if (difficultyMin > 0) f.difficulty_min = difficultyMin;
    if (difficultyMax < 5) f.difficulty_max = difficultyMax;
    return f;
  }, [search, category, players, difficultyMin, difficultyMax]);

  const { games, loading } = useGames(filters);

  // Get unique categories from all games for filter buttons
  const categories = useMemo(() => {
    const cats = new Set<string>();
    games.forEach((g) => g.category?.forEach((c) => cats.add(c)));
    return Array.from(cats);
  }, [games]);

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-page mx-auto">
        {/* Page header */}
        <div className="mb-10">
          <p className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-2">
            Collection
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-white">全部桌游</h1>
          <p className="text-muted mt-2 text-sm">
            {loading ? '加载中...' : `共 ${games.length} 款`}
          </p>
        </div>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          players={players}
          onPlayersChange={setPlayers}
          difficultyMin={difficultyMin}
          onDifficultyMinChange={setDifficultyMin}
          difficultyMax={difficultyMax}
          onDifficultyMaxChange={setDifficultyMax}
          categories={categories}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface rounded-lg aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : (
          <GameGrid games={games} />
        )}
      </div>
    </div>
  );
}
