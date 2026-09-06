import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/rent', label: 'Rent' },
  { to: '/buy', label: 'Buy' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white">
            <HomeIcon size={18} />
          </span>
          <span className="font-display text-xl font-semibold text-forest-800">KigaliHomes</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-forest-700' : 'text-gray-600 hover:text-forest-700'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!user && (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-forest-700">
                Login
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm">Register</Button>
              </Link>
              <Link to="/contact">
                <Button variant="primary" size="sm">List Property</Button>
              </Link>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-3 hover:bg-gray-50"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-100 text-forest-700">
                  <User size={15} />
                </span>
                <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1.5 shadow-card">
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-gray-50"
                  >
                    <LayoutDashboard size={15} /> {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-charcoal hover:bg-gray-50"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button variant="primary" className="w-full">Register</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">{user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}</Button>
                  </Link>
                  <Button variant="danger" className="w-full" onClick={handleLogout}>Logout</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
