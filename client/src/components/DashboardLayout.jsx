import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DashboardSidebar from './DashboardSidebar';
import DashboardMobileTabs from './DashboardMobileTabs';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <DashboardMobileTabs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
