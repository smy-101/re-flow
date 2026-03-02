'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import FeedList from '@/components/feeds/FeedList';

export default function FeedsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的订阅</h1>
        <Link href="/feeds/add">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加订阅
          </Button>
        </Link>
      </div>

      <FeedList />
    </div>
  );
}
