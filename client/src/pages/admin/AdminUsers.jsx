import { useEffect, useState } from 'react';
import { Search, Ban, RotateCcw, UserPlus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { RowSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

const emptyNewUser = { name: '', username: '', email: '', phone: '', password: '', role: 'owner' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [tab, setTab] = useState('active'); // 'active' | 'deleted'
  const [selected, setSelected] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState(emptyNewUser);
  const [newUserErrors, setNewUserErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [editUser, setEditUser] = useState(null); // the user object being edited, or null
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null); // user pending delete confirmation

  const load = () => {
    setLoading(true);
    api
      .get('/admin/users', {
        params: {
          keyword: keyword || undefined,
          role: roleFilter || undefined,
          deleted: tab === 'deleted' ? 'true' : undefined,
        },
      })
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User disabled' : 'User enabled');
      setUsers((list) => list.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u)));
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/users/${confirmDelete._id}`);
      toast.success('User deleted');
      setUsers((list) => list.filter((u) => u._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRestore = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/restore`);
      toast.success('User restored');
      setUsers((list) => list.filter((u) => u._id !== user._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore user');
    }
  };

  // --- Add owner/agent ---
  const updateNewUser = (key, value) => setNewUser((f) => ({ ...f, [key]: value }));

  const validateNewUser = () => {
    const errs = {};
    if (!newUser.name) errs.name = 'Full name is required';
    if (!newUser.username) errs.username = 'Username is required';
    if (!/^\S+@\S+\.\S+$/.test(newUser.email)) errs.email = 'Enter a valid email';
    if (!newUser.phone) errs.phone = 'Phone number is required';
    if (newUser.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setNewUserErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateNewUser()) return;
    setCreating(true);
    try {
      await api.post('/admin/users', newUser);
      toast.success(`${newUser.role === 'owner' ? 'Owner/agent' : 'Seeker'} account created`);
      setAddOpen(false);
      setNewUser(emptyNewUser);
      setNewUserErrors({});
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  // --- Edit user ---
  const openEdit = (user) => {
    setEditUser({ ...user });
    setEditErrors({});
  };

  const updateEditField = (key, value) => setEditUser((f) => ({ ...f, [key]: value }));

  const validateEdit = () => {
    const errs = {};
    if (!editUser.name) errs.name = 'Full name is required';
    if (!editUser.username) errs.username = 'Username is required';
    if (!/^\S+@\S+\.\S+$/.test(editUser.email)) errs.email = 'Enter a valid email';
    if (!editUser.phone) errs.phone = 'Phone number is required';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateEdit()) return;
    setSaving(true);
    try {
      const res = await api.put(`/admin/users/${editUser._id}`, {
        name: editUser.name,
        username: editUser.username,
        email: editUser.email,
        phone: editUser.phone,
        bio: editUser.bio,
        role: editUser.role,
      });
      toast.success('User updated');
      setUsers((list) => list.map((u) => (u._id === editUser._id ? res.data.user : u)));
      setEditUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-charcoal">User Management</h1>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus size={16} /> Add Owner / Agent
        </Button>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Owner/agent accounts can only be created here — there's no public sign-up for that role, by design.
      </p>

      {/* Active / Deleted tabs */}
      <div className="mt-5 flex gap-1 border-b border-gray-100">
        {[
          { key: 'active', label: 'Active' },
          { key: 'deleted', label: 'Deleted' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-forest-600 text-forest-700' : 'border-transparent text-gray-500 hover:text-charcoal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by name, email, username"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus-ring focus:border-forest-500"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus-ring">
          <option value="">All roles</option>
          <option value="seeker">Seeker</option>
          <option value="owner">Owner/Agent</option>
        </select>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-4"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
        ) : users.length === 0 ? (
          <div className="p-4">
            <EmptyState title={tab === 'deleted' ? 'No deleted users' : 'No users found'} />
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">{tab === 'deleted' ? 'Deleted' : 'Joined'}</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/60">
                  <td className="cursor-pointer px-4 py-3 font-medium text-charcoal" onClick={() => setSelected(u)}>{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{u.role}</td>
                  <td className="px-4 py-3">
                    {tab === 'deleted' ? (
                      <Badge tone="red">Deleted</Badge>
                    ) : (
                      <Badge tone={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(tab === 'deleted' ? u.deletedAt : u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {tab === 'deleted' ? (
                        <button
                          onClick={() => handleRestore(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 px-2.5 py-1 text-xs text-forest-700 hover:bg-forest-50"
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(u)}
                            title="Edit"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(u)}
                            title={u.isActive ? 'Disable' : 'Enable'}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                              u.isActive ? 'border-gold-200 text-gold-700 hover:bg-gold-50' : 'border-forest-200 text-forest-700 hover:bg-forest-50'
                            }`}
                          >
                            {u.isActive ? <><Ban size={13} /> Disable</> : <><RotateCcw size={13} /> Enable</>}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u)}
                            title="Delete"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User details */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User details">
        {selected && (
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Name:</span> {selected.name}</p>
            <p><span className="text-gray-400">Username:</span> {selected.username}</p>
            <p><span className="text-gray-400">Email:</span> {selected.email}</p>
            <p><span className="text-gray-400">Phone:</span> {selected.phone}</p>
            <p><span className="text-gray-400">Role:</span> <span className="capitalize">{selected.role}</span></p>
            <p><span className="text-gray-400">Joined:</span> {new Date(selected.createdAt).toLocaleDateString()}</p>
          </div>
        )}
      </Modal>

      {/* Add owner/agent */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); setNewUserErrors({}); }}
        title="Add Owner / Agent"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={creating} onClick={handleCreateUser}>Create Account</Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <p className="text-xs text-gray-500">
            This creates a login the owner/agent can use right away. Share the password with them securely —
            it isn't emailed automatically in this MVP.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={newUser.name} onChange={(e) => updateNewUser('name', e.target.value)} error={newUserErrors.name} />
            <Input label="Username" value={newUser.username} onChange={(e) => updateNewUser('username', e.target.value)} error={newUserErrors.username} />
          </div>
          <Input label="Email" type="email" value={newUser.email} onChange={(e) => updateNewUser('email', e.target.value)} error={newUserErrors.email} />
          <Input label="Phone" value={newUser.phone} onChange={(e) => updateNewUser('phone', e.target.value)} error={newUserErrors.phone} />
          <Input label="Temporary Password" type="password" value={newUser.password} onChange={(e) => updateNewUser('password', e.target.value)} error={newUserErrors.password} />
          <Select label="Account Type" value={newUser.role} onChange={(e) => updateNewUser('role', e.target.value)}>
            <option value="owner">Owner / Agent</option>
            <option value="seeker">Property Seeker</option>
          </Select>
        </form>
      </Modal>

      {/* Edit user */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button loading={saving} onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        {editUser && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" value={editUser.name} onChange={(e) => updateEditField('name', e.target.value)} error={editErrors.name} />
              <Input label="Username" value={editUser.username} onChange={(e) => updateEditField('username', e.target.value)} error={editErrors.username} />
            </div>
            <Input label="Email" type="email" value={editUser.email} onChange={(e) => updateEditField('email', e.target.value)} error={editErrors.email} />
            <Input label="Phone" value={editUser.phone} onChange={(e) => updateEditField('phone', e.target.value)} error={editErrors.phone} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-charcoal">Bio</span>
              <textarea
                rows={3}
                value={editUser.bio || ''}
                onChange={(e) => updateEditField('bio', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
              />
            </label>
            <Select label="Account Type" value={editUser.role} onChange={(e) => updateEditField('role', e.target.value)}>
              <option value="owner">Owner / Agent</option>
              <option value="seeker">Property Seeker</option>
            </Select>
          </form>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this user?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete User</Button>
          </>
        }
      >
        {confirmDelete && (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-charcoal">{confirmDelete.name}</span> will be moved to the
            Deleted tab and immediately blocked from logging in. Their listings, messages and favorites are
            kept — you can restore this account at any time from the Deleted tab.
          </p>
        )}
      </Modal>
    </div>
  );
}
