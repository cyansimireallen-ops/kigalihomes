import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Mobile-only bar to open the dashboard menu (Messages, Profile, Settings, etc.) —
          the sidebar itself is hidden below lg, same pattern as the admin panel. */}
      <div className="flex items-center border-b border-gray-100 px-4 py-2.5 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg border border-gray-200 p-2 text-charcoal hover:bg-gray-50"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <DashboardSidebar open={open} onClose={() => setOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
