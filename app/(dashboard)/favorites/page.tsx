'use client';

import ItemList from '@/components/items/ItemList';

export default function FavoritesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">收藏</h1>
      </div>

      <ItemList filterFavorite={true} />
    </div>
  );
}
