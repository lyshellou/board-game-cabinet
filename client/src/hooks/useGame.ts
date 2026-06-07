import { useState, useEffect } from 'react';
import { BoardGame } from '../types';
import { fetchGame } from '../lib/api';

export function useGame(id: number) {
  const [game, setGame] = useState<BoardGame | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGame(id)
      .then((data) => {
        if (!cancelled) {
          setGame(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { game, loading };
}
