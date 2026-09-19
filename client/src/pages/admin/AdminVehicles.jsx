import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, X as XIcon, Star, BadgeCheck, Flag, Trash2, Pencil, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { RowSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { formatPrice, imageUrl } from '../../utils/format';

const statusTone = { pending: 'gold', approved: 'green', rejected: 'red', sold: 'gray', rented: 'gray' };

function VehicleActions({ v, onUpdate, onDeleteRequest }) {
  return (
    <>
      {v.status === 'pending' && (
        <>
          <button title="Approve" onClick={() => onUpdate(v, { status: 'approved' }, 'Approved')} className="rounded-lg border border-forest-200 p-1.5 text-forest-700 hover:bg-forest-50"><Check size={14} /></button>
          <button title="Reject" onClick={() => onUpdate(v, { status: 'rejected' }, 'Rejected')} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"><XIcon size={14} /></button>
        </>
      )}
      <button title={v.isFeatured ? 'Remove featured' : 'Mark featured'} onClick={() => onUpdate(v, { isFeatured: !v.isFeatured }, v.isFeatured ? 'Removed from featured' : 'Marked as featured')} className="rounded-lg border border-gold-200 p-1.5 text-gold-600 hover:bg-gold-50"><Star size={14} fill={v.isFeatured ? '#c98d21' : 'none'} /></button>
      <button title={v.isVerified ? 'Remove verification' : 'Verify'} onClick={() => onUpdate(v, { isVerified: !v.isVerified }, v.isVerified ? 'Verification removed' : 'Marked as verified')} className="rounded-lg border border-forest-200 p-1.5 text-forest-700 hover:bg-forest-50"><BadgeCheck size={14} /></button>
      <button title={v.isFraud ? 'Unmark fraud' : 'Mark as fraud'} onClick={() => onUpdate(v, { isFraud: !v.isFraud }, v.isFraud ? 'Fraud flag removed' : 'Marked as fraud')} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"><Flag size={14} /></button>
      <Link to={`/admin/vehicles/${v._id}/edit`} title="Edit" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"><Pencil size={14} /></Link>
      <button title="Delete" onClick={() => onDeleteRequest(v)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"><Trash2 size={14} /></button>
    </>
  );
}

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/vehicles', { params: { keyword: keyword || undefined, status: statusFilter || undefined } })
      .then((res) => setVehicles(res.data.vehicles))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const updateVehicle = async (v, fields, successMsg) => {
    try {
      await api.put(`/admin/vehicles/${v._id}`, fields);
      toast.success(successMsg);
      setVehicles((list) => list.map((x) => (x._id === v._id ? { ...x, ...fields } : x)));
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/vehicles/${confirmDelete._id}`);
      toast.success('Vehicle deleted');
      setVehicles((list) => list.filter((x) => x._id !== confirmDelete._id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-charcoal">Vehicle Management</h1>
        <Button to="/admin/vehicles/new"><PlusCircle size={16} /> Add Vehicle</Button>
      </div>

      <form onSubmit={handleSearch} className="mt-5 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title, make, model"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-4"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
        ) : vehicles.length === 0 ? (
          <div className="p-4"><EmptyState title="No vehicles found" /></div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map((v) => (
                    <tr key={v._id}>
                      <td className="flex items-center gap-3 px-4 py-3">
                        <img src={imageUrl(v.images?.[0])} className="h-10 w-14 rounded-lg object-cover" alt="" />
                        <div>
                          <p className="font-medium text-charcoal">{v.title}</p>
                          <p className="text-xs text-gray-400">{v.make} {v.model} · {v.year}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{v.owner?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{formatPrice(v.price, v.purpose)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge tone={statusTone[v.status]}>{v.status}</Badge>
                          {v.isFeatured && <Badge tone="gold">Featured</Badge>}
                          {v.isVerified && <Badge tone="green">Verified</Badge>}
                          {v.isFraud && <Badge tone="red">Fraud</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <VehicleActions v={v} onUpdate={updateVehicle} onDeleteRequest={setConfirmDelete} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <ul className="divide-y divide-gray-100 md:hidden">
              {vehicles.map((v) => (
                <li key={v._id} className="p-4">
                  <div className="flex gap-3">
                    <img src={imageUrl(v.images?.[0])} className="h-14 w-20 shrink-0 rounded-lg object-cover" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-charcoal">{v.title}</p>
                      <p className="text-xs text-gray-400">{v.make} {v.model} · {v.year}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{v.owner?.name} · {formatPrice(v.price, v.purpose)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={statusTone[v.status]}>{v.status}</Badge>
                    {v.isFeatured && <Badge tone="gold">Featured</Badge>}
                    {v.isVerified && <Badge tone="green">Verified</Badge>}
                    {v.isFraud && <Badge tone="red">Fraud</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <VehicleActions v={v} onUpdate={updateVehicle} onDeleteRequest={setConfirmDelete} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete vehicle?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">This will permanently remove "{confirmDelete?.title}" from the platform.</p>
      </Modal>
    </div>
  );
}
