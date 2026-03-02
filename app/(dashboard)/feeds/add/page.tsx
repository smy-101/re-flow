'use client';

import AddFeedForm from '@/components/feeds/AddFeedForm';

export default function AddFeedPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">添加订阅</h1>
      <AddFeedForm />
    </div>
  );
}
