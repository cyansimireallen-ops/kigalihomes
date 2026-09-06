import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Home as HomeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      login(res.data.token, res.data.user, 'user');
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-forest-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/35 via-forest-900/70 to-forest-900/90" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400 text-forest-900">
              <HomeIcon size={20} />
            </span>
            <span className="font-display text-2xl font-semibold text-white">KigaliHomes</span>
          </Link>
          <h2 className="mt-14 max-w-sm font-display text-3xl leading-snug text-white">
            Welcome back. Your next home is a search away.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-forest-100">
            Log in to manage your saved properties, messages, and listings.
          </p>
        </div>
        <p className="relative z-10 text-xs text-forest-300">
          &copy; {new Date().getFullYear()} KigaliHomes. Kigali, Rwanda.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white">
              <HomeIcon size={18} />
            </span>
            <span className="font-display text-xl font-semibold text-forest-800">KigaliHomes</span>
          </Link>

          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500">Log in to manage your listings and saved properties.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Input label="Email or Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-9 text-gray-400 hover:text-charcoal"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-medium text-forest-700 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" size="lg" className="w-full shadow-sm shadow-forest-600/20" loading={loading}>
              Log In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="font-medium text-forest-700 hover:underline">Register</Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            Are you an admin? <Link to="/admin/login" className="underline">Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
