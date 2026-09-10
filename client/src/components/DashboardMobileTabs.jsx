import { NavLink } from 'react-router-dom';
import { useDashboardLinks } from './DashboardSidebar';

// The desktop sidebar (DashboardSidebar) is hidden below the `lg` breakpoint —
// without this, mobile users landing on /dashboard had no way to reach
// Messages, Profile, Settings, Saved Properties, or (for owners) My Listings.
export default function DashboardMobileTabs() {
  const links = useDashboardLinks();

  return (
    <nav className="-mx-4 mb-4 flex gap-1 overflow-x-auto border-b border-gray-100 px-4 pb-1 lg:hidden">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'border-forest-600 text-forest-700' : 'border-transparent text-gray-500'
            }`
          }
        >
          <Icon size={15} /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
