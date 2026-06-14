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
          <div className="h-4 w-24 bg-surface rounded animate-pulse mb-8" />
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Left skeleton */}
            <div className="lg:w-[40%] flex-shrink-0 flex items-center">
              <div className="bg-surface rounded-xl animate-pulse aspect-[3/4] max-w-[280px] mx-auto" />
            </div>
            {/* Right skeleton */}
            <div className="lg:w-[60%] space-y-4">
              <div className="h-5 w-16 bg-surface rounded-full animate-pulse" />
              <div className="h-10 w-56 bg-surface rounded animate-pulse" />
              <div className="h-5 w-36 bg-surface rounded animate-pulse" />
              <div className="h-10 w-24 bg-surface rounded animate-pulse mt-2" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-surface rounded-lg animate-pulse" />
                ))}
              </div>
              {/* Description skeleton */}
              <div className="space-y-2 pt-4">
                <div className="h-5 w-20 bg-surface rounded animate-pulse" />
                <div className="h-3 w-full bg-surface rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-surface rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-surface rounded animate-pulse" />
              </div>
            </div>
          </div>
          {/* Review skeleton */}
          <div className="mt-16 space-y-2">
            <div className="h-5 w-20 bg-surface rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-surface rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-surface rounded animate-pulse" />
          </div>
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
    const dots: string[] = [];
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

        {/* Hero: left-right split */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left: Cover image — centered vertically + horizontally in the 40% column */}
          <div className="lg:w-[40%] flex-shrink-0 flex items-center">
            <div className="rounded-xl overflow-hidden shadow-xl shadow-black/20 bg-surface/30 max-w-[340px] mx-auto">
              {game.image ? (
                <img
                  src={game.image}
                  alt={game.name}
                  className="max-w-full h-auto w-full block"
                />
              ) : (
                <div className="flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 aspect-[3/4]">
                  <span className="font-heading text-6xl text-white/8 select-none">
                    {game.name[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info (~60%) */}
          <div className="lg:w-[60%] space-y-5">
            {/* Category tag */}
            {game.category && (
              <span className="inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                {game.category}
              </span>
            )}

            {/* Chinese name */}
            <h1 className="font-heading text-4xl sm:text-5xl text-white leading-tight tracking-tight">
              {game.name}
            </h1>

            {/* English name */}
            {game.name_en && (
              <p className="font-mono text-muted text-sm tracking-wide">
                {game.name_en}
              </p>
            )}

            {/* Rating — prominent, right below title */}
            <div className="flex items-baseline gap-2 pt-1">
              <Star size={28} className="text-accent fill-accent shrink-0" />
              <span className="font-mono text-5xl text-accent font-medium tracking-tight tabular-nums">
                {game.rating.toFixed(1)}
              </span>
              <span className="text-muted text-sm">/ 10</span>
            </div>

            {/* Info cards: compact 2×2 grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface/50 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-muted mb-0.5">
                  <Users size={12} />
                  <span className="text-[11px] uppercase tracking-wider">人数</span>
                </div>
                <p className="font-mono text-white text-sm">{playerRange}</p>
              </div>

              <div className="bg-surface/50 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-muted mb-0.5">
                  <Clock size={12} />
                  <span className="text-[11px] uppercase tracking-wider">人均时长</span>
                </div>
                <p className="font-mono text-white text-sm">
                  {game.duration_per_player} 分钟
                </p>
              </div>

              <div className="bg-surface/50 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-muted mb-0.5">
                  <Brain size={12} />
                  <span className="text-[11px] uppercase tracking-wider">难度</span>
                </div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {difficultyDots(game.difficulty).map((state, i) => (
                    <span key={i} className={`difficulty-dot ${state}`} />
                  ))}
                  <span className="font-mono text-[11px] text-muted ml-1">
                    {game.difficulty}
                  </span>
                </div>
              </div>

              <div className="bg-surface/50 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-muted mb-0.5">
                  <Calendar size={12} />
                  <span className="text-[11px] uppercase tracking-wider">出版</span>
                </div>
                <p className="font-mono text-white text-sm">{game.published_year}</p>
              </div>
            </div>

            {/* Description — under info cards in right column */}
            <section className="pt-4">
              <h2 className="font-heading text-lg text-white mb-3">玩法介绍</h2>
              <p className="text-muted leading-relaxed text-[15px]">
                {game.description}
              </p>
            </section>
          </div>
        </div>

        {/* Divider */}
        <hr className="section-divider my-12" />

        {/* Review — spans full page width, aligns with image left and info right */}
        {game.review && (
          <section>
            <h2 className="font-heading text-xl text-white mb-4">我的评价</h2>
            <blockquote className="text-muted leading-relaxed text-[15px] border-l-2 border-accent/30 pl-5 italic">
              {game.review}
            </blockquote>
          </section>
        )}
      </div>
    </div>
  );
}
