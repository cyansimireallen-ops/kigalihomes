import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, ShieldCheck, Search, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import PhoneInput from '../../components/PhoneInput';
import Button from '../../components/Button';

const perks = [
  { icon: Search, text: 'Search verified houses, apartments and plots across Kigali' },
  { icon: Heart, text: 'Save your favorite properties and compare them later' },
  { icon: ShieldCheck, text: 'Contact owners and agents directly, with no middlemen' },
];

export default function Register() {
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Full name is required';
    if (!form.username) errs.username = 'Username is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone) errs.phone = 'Phone number is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user, 'user');
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-forest-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
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
            Find a place you'll love to call home.
          </h2>
        </div>
        <ul className="relative z-10 space-y-4">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-forest-100">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-300">
                <Icon size={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>
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

          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">Create your account</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Join as a home seeker to search, save and contact owners for free.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
              <Input label="Username" value={form.username} onChange={(e) => update('username', e.target.value)} error={errors.username} />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
            <PhoneInput label="Phone" value={form.phone} onChange={(v) => update('phone', v)} error={errors.phone} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} error={errors.password} />
              <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} error={errors.confirmPassword} />
            </div>

            <Button type="submit" size="lg" className="w-full shadow-sm shadow-forest-600/20" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="font-medium text-forest-700 hover:underline">Log in</Link>
          </p>

          <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50/60 px-4 py-3 text-xs text-forest-800">
            <span className="font-semibold">Are you a property owner or agent?</span> Owner/agent accounts are
            set up by our team for security. <Link to="/contact" className="font-medium underline">Contact us</Link> to
            get listed on KigaliHomes.
          </div>
        </div>
      </div>
    </div>
  );
}
