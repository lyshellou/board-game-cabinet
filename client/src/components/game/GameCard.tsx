import { Link } from 'react-router-dom';
import { BoardGame } from '../../types';

interface GameCardProps {
  game: BoardGame;
  featured?: boolean;
}

export default function GameCard({ game, featured }: GameCardProps) {
  const playerRange =
    game.player_count_min === game.player_count_max
      ? `${game.player_count_min}人`
      : `${game.player_count_min}-${game.player_count_max}人`;

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
    <Link
      to={`/game/${game.id}`}
      className={`group block bg-surface/50 backdrop-blur-xl rounded-lg overflow-hidden border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] card-lift ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-surface">
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="font-heading text-4xl text-white/20">{game.name[0]}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading text-lg text-white truncate">{game.name}</h3>
            {game.name_en && (
              <p className="text-xs text-muted font-mono tracking-wide truncate">
                {game.name_en}
              </p>
            )}
          </div>
          <span className="font-mono text-sm text-accent whitespace-nowrap shrink-0">
            ★ {game.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted">
          <span>{playerRange}</span>
          <span>人均{game.duration_per_player}′</span>
          <span className="flex gap-0.5">
            {difficultyDots(game.difficulty).map((state, i) => (
              <span key={i} className={`difficulty-dot ${state}`} />
            ))}
          </span>
        </div>

        {game.category && (
          <span className="inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
            {game.category}
          </span>
        )}
      </div>
    </Link>
  );
}
