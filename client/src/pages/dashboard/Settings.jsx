import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const updatePw = (key, value) => setPwForm((f) => ({ ...f, [key]: value }));

  const handlePasswordChange = async (e) => {
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

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/me');
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl text-charcoal">Settings</h1>

      <form onSubmit={handlePasswordChange} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg text-charcoal">Change Password</h2>
        <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={(e) => updatePw('currentPassword', e.target.value)} required />
        <Input label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => updatePw('newPassword', e.target.value)} required />
        <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={(e) => updatePw('confirmPassword', e.target.value)} required />
        <Button type="submit" loading={loading}>Update Password</Button>
      </form>

      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <h2 className="font-display text-lg text-red-700">Delete Account</h2>
        <p className="mt-1 text-sm text-red-600/80">This permanently deletes your account and listings. This can't be undone.</p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmDeleteOpen(true)}>Delete My Account</Button>
      </div>

      <Modal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete your account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteAccount}>Yes, delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">This action is permanent and cannot be undone.</p>
      </Modal>
    </div>
  );
}
