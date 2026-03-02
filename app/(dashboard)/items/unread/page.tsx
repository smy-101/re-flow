'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import ItemList from '@/components/items/ItemList';

export default function UnreadItemsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">未读文章</h1>
        <Link href="/items">
          <Button variant="secondary">显示全部</Button>
        </Link>
      </div>

      <ItemList filterStatus="unread" showMarkAllRead />
    </div>
  );
}
