import { useCallback, useState } from 'react';
import { getItem, setItem } from '../lib/storage';

function loadFavorites() {
  try {
    return JSON.parse(getItem('yt_favorites', '[]'));
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites);

  const isFav = useCallback((id) => favorites.some((f) => f.id === id), [favorites]);

  const toggleFavorite = useCallback((item) => {
    setFavorites((prev) => {
      const next = prev.some((f) => f.id === item.id)
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, item];
      setItem('yt_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, isFav, toggleFavorite };
}
