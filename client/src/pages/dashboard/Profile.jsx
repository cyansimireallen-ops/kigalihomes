import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import PhoneInput from '../../components/PhoneInput';
import Button from '../../components/Button';
import { imageUrl } from '../../utils/format';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', username: user?.username || '', email: user?.email || '',
    phone: user?.phone || '', bio: user?.bio || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (avatar) data.append('profileImage', avatar);
      const res = await api.put('/users/me', data);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-charcoal">Profile</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={avatar ? URL.createObjectURL(avatar) : imageUrl(user?.profileImage)}
            className="h-16 w-16 rounded-full object-cover"
            alt="Profile"
          />
          <label className="cursor-pointer text-sm font-medium text-forest-700 hover:underline">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatar(e.target.files[0])} />
          </label>
        </div>

        <Input label="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <Input label="Username" value={form.username} onChange={(e) => update('username', e.target.value)} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <PhoneInput label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-charcoal">Bio</span>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
          />
        </label>

        <Button type="submit" loading={loading}>Save Changes</Button>
      </form>
    </div>
  );
}
