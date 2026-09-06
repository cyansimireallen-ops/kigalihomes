import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, PlusCircle, Flag, Settings, Home,
  MessageSquare, Heart, User, FileText,
} from 'lucide-react';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/properties', label: 'Properties', icon: Building2, end: true },
  { to: '/admin/properties/new', label: 'Add Property', icon: PlusCircle },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/content', label: 'Site Content', icon: FileText },
];

const personalLinks = [
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/favorites', label: 'Saved Properties', icon: Heart },
  { to: '/admin/profile', label: 'Profile', icon: User },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-forest-50 text-forest-700' : 'text-gray-600 hover:bg-gray-50'
        }`
      }
    >
      <Icon size={17} /> {label}
    </NavLink>
  );
}

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-100 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-600 text-white">
            <Home size={16} />
          </span>
          <span className="font-display text-lg font-semibold text-forest-800">KigaliHomes</span>
        </div>
        <p className="px-5 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Admin panel</p>
        <nav className="space-y-1 px-3">
          {links.map((l) => <NavItem key={l.to} {...l} onClick={onClose} />)}
        </nav>
        <p className="px-5 pb-2 pt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">Personal</p>
        <nav className="space-y-1 px-3 pb-4">
          {personalLinks.map((l) => <NavItem key={l.to} {...l} onClick={onClose} />)}
        </nav>
      </aside>
    </>
  );
}
