'use client';

import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Sidebar from '@/components/layout/Sidebar';
import { FavoriteProvider } from '@/lib/context/FavoriteContext';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/hooks/swr/config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig value={swrConfig}>
      <FavoriteProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
          <DashboardNavbar />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-4 py-6 md:px-6 lg:px-8 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </FavoriteProvider>
    </SWRConfig>
  );
}
