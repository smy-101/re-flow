'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchFavoriteCount } from '@/lib/api/items';

interface FavoriteContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  refresh: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  // Initial fetch of favorite count
  useEffect(() => {
    async function loadFavoriteCount() {
      try {
        const result = await fetchFavoriteCount();
        setCount(result.count);
      } catch (error) {
        console.error('Failed to fetch favorite count:', error);
      }
    }
    loadFavoriteCount();
  }, []);

  const increment = () => {
    setCount((prev) => prev + 1);
  };

  const decrement = () => {
    setCount((prev) => Math.max(0, prev - 1));
  };

  const refresh = async () => {
    try {
      const result = await fetchFavoriteCount();
      setCount(result.count);
    } catch (error) {
      console.error('Failed to refresh favorite count:', error);
    }
  };

  return (
    <FavoriteContext.Provider value={{ count, increment, decrement, refresh }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavoriteCount() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavoriteCount must be used within a FavoriteProvider');
  }
  return context;
}
