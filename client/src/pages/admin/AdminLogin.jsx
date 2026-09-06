import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', { identifier, password });
      login(res.data.token, res.data.user, 'admin');
      toast.success('Welcome to the admin dashboard');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white">
            <Home size={18} />
          </span>
          <span className="font-display text-lg font-semibold text-forest-800">KigaliHomes</span>
        </div>
        <h1 className="font-display text-2xl text-charcoal">Admin Login</h1>
        <p className="mt-1 text-sm text-gray-500">Access the KigaliHomes admin dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Input label="Email or Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" loading={loading}>Log In</Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          First time setting up? <Link to="/admin/register" className="underline">Register the first admin</Link>
        </p>
      </div>
    </div>
  );
}
