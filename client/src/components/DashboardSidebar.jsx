import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, Heart, MessageSquare, User, Settings, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Seekers browse, save, message and manage their profile — they never see listing
// management, since only owners/agents (created by an admin) or admins can list property.
const seekerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/favorites', label: 'Saved Properties', icon: Heart },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const ownerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/listings', label: 'My Listings', icon: Building2 },
  { to: '/dashboard/listings/new', label: 'Add Property', icon: PlusCircle },
  { to: '/favorites', label: 'Saved Properties', icon: Heart },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// Shared with DashboardLayout so both know which set of links to render.
export function useDashboardLinks() {
  const { user } = useAuth();
  return user?.role === 'seeker' ? seekerLinks : ownerLinks;
}

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

// On desktop (lg+) this renders as a normal static sidebar. Below that, it becomes
// a slide-in drawer controlled by `open`/`onClose` — same pattern as AdminSidebar,
// so the mobile experience feels consistent between the user dashboard and admin.
export default function DashboardSidebar({ open = false, onClose = () => {} }) {
  const links = useDashboardLinks();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform border-r border-gray-100 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5 lg:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-600 text-white">
            <Home size={16} />
          </span>
          <span className="font-display text-lg font-semibold text-forest-800">KigaliHomes</span>
        </div>
        <nav className="space-y-1 p-4 lg:sticky lg:top-16">
          {links.map((l) => <NavItem key={l.to} {...l} onClick={onClose} />)}
        </nav>
      </aside>
    </>
  );
}
