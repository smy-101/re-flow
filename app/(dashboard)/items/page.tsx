'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import ItemList from '@/components/items/ItemList';

export default function ItemsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的阅读</h1>
        <div className="flex gap-2">
          <Link href="/items/unread">
            <Button variant="secondary">仅未读</Button>
          </Link>
        </div>
      </div>

      <ItemList filterStatus="all" />
    </div>
  );
}
