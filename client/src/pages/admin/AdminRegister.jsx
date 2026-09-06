import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminRegister() {
  const [status, setStatus] = useState('checking'); // checking | open | closed
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/admin/register-status').then((res) => setStatus(res.data.open ? 'open' : 'closed'));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/register', form);
      login(res.data.token, res.data.user, 'admin');
      toast.success('Admin account created');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'checking') return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white">
            <Home size={18} />
          </span>
          <span className="font-display text-lg font-semibold text-forest-800">KigaliHomes</span>
        </div>
        <h1 className="font-display text-2xl text-charcoal">Admin Registration</h1>

        {status === 'closed' ? (
          <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
            Admin registration is closed.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-gray-500">Set up the first admin account for KigaliHomes.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
              <Input label="Username" value={form.username} onChange={(e) => update('username', e.target.value)} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
              <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
              <Button type="submit" className="w-full" loading={loading}>Create Admin Account</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
