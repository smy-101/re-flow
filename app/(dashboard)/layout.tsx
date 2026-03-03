import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <DashboardNavbar />
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <Sidebar />
        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
