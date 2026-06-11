import { useParams, Link } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { ChevronLeft, Users, Clock, Brain, Calendar, Star } from 'lucide-react';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { game, loading } = useGame(Number(id));

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-page mx-auto">
          <div className="bg-surface rounded-lg aspect-[16/9] animate-pulse mb-8" />
          <div className="h-10 w-48 bg-surface rounded animate-pulse mb-4" />
          <div className="h-6 w-32 bg-surface rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-page mx-auto py-20">
          <h2 className="font-heading text-2xl text-white mb-4">游戏未找到</h2>
          <Link to="/gallery" className="text-accent hover:underline text-sm">
            返回画廊
          </Link>
        </div>
      </div>
    );
  }

  const playerRange =
    game.player_count_min === game.player_count_max
      ? `${game.player_count_min} 人`
      : `${game.player_count_min} - ${game.player_count_max} 人`;

  const difficultyDots = (level: number) => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(level)) {
        dots.push('filled');
      } else if (i === Math.ceil(level) && level % 1 !== 0) {
        dots.push('filled-half');
      } else {
        dots.push('empty');
      }
    }
    return dots;
  };

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-page mx-auto">
        {/* Back link */}
        <Link
          to="/gallery"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={16} /> 返回画廊
        </Link>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image */}
          <div>
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {game.image ? (
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <span className="font-heading text-8xl text-white/10">{game.name[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            <div>
              {game.category && (
                <span className="inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 mb-3">
                  {game.category}
                </span>
              )}
              <h1 className="font-heading text-4xl sm:text-5xl text-white leading-tight">
                {game.name}
              </h1>
              {game.name_en && (
                <p className="font-mono text-muted text-sm mt-1 tracking-wide">
                  {game.name_en}
                </p>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Users size={14} />
                  <span className="text-xs uppercase tracking-wider">人数</span>
                </div>
                <p className="font-mono text-white text-lg">{playerRange}</p>
              </div>
              <div className="bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Clock size={14} />
                  <span className="text-xs uppercase tracking-wider">人均时长</span>
                </div>
                <p className="font-mono text-white text-lg">{game.duration_per_player} 分钟</p>
              </div>
              <div className="bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Brain size={14} />
                  <span className="text-xs uppercase tracking-wider">难度</span>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {difficultyDots(game.difficulty).map((state, i) => (
                    <span key={i} className={`difficulty-dot ${state}`} />
                  ))}
                  <span className="font-mono text-xs text-muted ml-1">{game.difficulty}</span>
                </div>
              </div>
              <div className="bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Calendar size={14} />
                  <span className="text-xs uppercase tracking-wider">出版</span>
                </div>
                <p className="font-mono text-white text-lg">{game.published_year}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <Star size={20} className="text-accent fill-accent" />
              <span className="font-mono text-3xl text-accent">{game.rating.toFixed(1)}</span>
              <span className="text-muted text-sm">/ 10</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-heading text-lg text-white mb-3">玩法介绍</h3>
              <p className="text-muted leading-relaxed drop-cap">{game.description}</p>
            </div>

            {/* Review */}
            {game.review && (
              <div>
                <h3 className="font-heading text-lg text-white mb-3">个人评价</h3>
                <blockquote className="pull-quote">{game.review}</blockquote>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
