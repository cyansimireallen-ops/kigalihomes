import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function AdminSettings() {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setPwForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/me/password', pwForm);
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl text-charcoal">Settings</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg text-charcoal">Change Password</h2>
        <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={(e) => update('currentPassword', e.target.value)} required />
        <Input label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => update('newPassword', e.target.value)} required />
        <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
        <Button type="submit" loading={loading}>Update Password</Button>
      </form>
    </div>
  );
}
