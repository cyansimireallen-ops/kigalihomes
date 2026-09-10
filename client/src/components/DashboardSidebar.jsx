import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, Heart, MessageSquare, User, Settings } from 'lucide-react';
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

// Shared with DashboardMobileTabs so the desktop sidebar and the mobile tab bar
// never drift out of sync with each other.
export function useDashboardLinks() {
  const { user } = useAuth();
  return user?.role === 'seeker' ? seekerLinks : ownerLinks;
}

export default function DashboardSidebar() {
  const links = useDashboardLinks();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white lg:block">
      <nav className="sticky top-16 space-y-1 p-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-forest-50 text-forest-700' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
