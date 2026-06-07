import { useState, useEffect } from 'react';
import { BoardGame, GameFilters } from '../types';
import { fetchGames } from '../lib/api';

export function useGames(filters: GameFilters) {
  const [games, setGames] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGames(filters)
      .then((data) => {
        if (!cancelled) {
          setGames(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGames([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return { games, loading };
}

export function useFeatured() {
  const [games, setGames] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../lib/api').then(({ fetchFeatured }) => {
      fetchFeatured()
        .then(setGames)
        .catch(() => setGames([]))
        .finally(() => setLoading(false));
    });
  }, []);

  return { games, loading };
}
