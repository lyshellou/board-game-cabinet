import { BoardGame } from '../../types';
import GameCard from './GameCard';

interface GameGridProps {
  games: BoardGame[];
}

export default function GameGrid({ games }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted font-heading text-xl">暂无符合条件的桌游</p>
        <p className="text-muted/50 text-sm mt-2">试试调整筛选条件</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
