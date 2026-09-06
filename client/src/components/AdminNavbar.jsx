import { Menu, LogOut, User, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6">
      <button className="lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu />
      </button>
      <div className="hidden text-sm text-gray-500 lg:block">Admin dashboard</div>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-forest-700 hover:bg-forest-50"
          title="Opens the public homepage in a new tab — you stay logged into the admin panel"
        >
          <ExternalLink size={15} /> View Site
        </Link>
        <span className="flex items-center gap-2 text-sm font-medium text-charcoal">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-forest-100 text-forest-700">
            <User size={15} />
          </span>
          {user?.name}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </header>
  );
}
