import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  players: number;
  onPlayersChange: (v: number) => void;
  difficultyMin: number;
  onDifficultyMinChange: (v: number) => void;
  difficultyMax: number;
  onDifficultyMaxChange: (v: number) => void;
  categories: string[];
}

export default function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  players,
  onPlayersChange,
  difficultyMin,
  onDifficultyMinChange,
  difficultyMax,
  onDifficultyMaxChange,
  categories,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const hasFilters = category || players > 0 || difficultyMin > 0 || difficultyMax < 5;
  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('');
    onPlayersChange(0);
    onDifficultyMinChange(0);
    onDifficultyMaxChange(5);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Quick search + toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索桌游..."
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-muted outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
            expanded || hasFilters
              ? 'border-accent/50 text-accent bg-accent/5'
              : 'border-border text-muted hover:text-white'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">筛选</span>
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg p-4 space-y-4">
          {/* Category */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-2 block">分类</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange('')}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  !category
                    ? 'bg-accent text-bg'
                    : 'bg-white/5 text-muted hover:text-white hover:bg-white/10'
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat === category ? '' : cat)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    category === cat
                      ? 'bg-accent text-bg'
                      : 'bg-white/5 text-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-2 block">
              人数：{players > 0 ? `${players}人` : '不限'}
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={players}
              onChange={(e) => onPlayersChange(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>不限</span>
              <span>1</span>
              <span>4</span>
              <span>7</span>
              <span>10</span>
            </div>
          </div>

          {/* Difficulty range */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-2 block">
              难度：{difficultyMin} — {difficultyMax}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={difficultyMin}
                onChange={(e) => onDifficultyMinChange(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="text-xs text-muted">至</span>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={difficultyMax}
                onChange={(e) => onDifficultyMaxChange(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
            </div>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
            >
              <X size={12} /> 清除所有筛选
            </button>
          )}
        </div>
      )}
    </div>
  );
}
