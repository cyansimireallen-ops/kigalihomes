import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { RowSkeleton } from '../../components/Skeleton';
import { formatPrice, imageUrl } from '../../utils/format';
import Modal from '../../components/Modal';

const statusTone = { pending: 'gold', approved: 'green', rejected: 'red', sold: 'gray', rented: 'gray' };

function VehicleListingActions({ v, onMarkAs, onDeleteRequest }) {
  return (
    <>
      {v.status === 'approved' && v.purpose === 'sale' && (
        <button onClick={() => onMarkAs(v, 'sold')} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50">Mark Sold</button>
      )}
      {v.status === 'approved' && v.purpose === 'rent' && (
        <button onClick={() => onMarkAs(v, 'rented')} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50">Mark Rented</button>
      )}
      <Link to={`/dashboard/vehicles/${v._id}/edit`} className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"><Pencil size={14} /></Link>
      <button onClick={() => onDeleteRequest(v)} className="rounded-lg border border-gray-200 p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
    </>
  );
}

export default function MyVehicles() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/vehicles/mine/all').then((res) => setListings(res.data.vehicles)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/vehicles/${confirmDelete._id}`);
      toast.success('Listing deleted');
      setListings((l) => l.filter((x) => x._id !== confirmDelete._id));
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setConfirmDelete(null);
    }
  };

  const markAs = async (vehicle, status) => {
    try {
      await api.put(`/vehicles/${vehicle._id}`, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-charcoal">My Vehicles</h1>
        <Button to="/dashboard/vehicles/new">Add Vehicle</Button>
      </div>

      {loading ? (
        <div className="space-y-2"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
      ) : listings.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles yet" description="Add your first vehicle to start reaching buyers." action={<Button to="/dashboard/vehicles/new">Add Vehicle</Button>} />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Desktop / tablet: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((v) => (
                  <tr key={v._id}>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <img src={imageUrl(v.images?.[0])} className="h-10 w-14 rounded-lg object-cover" alt="" />
                      <span className="font-medium text-charcoal">{v.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatPrice(v.price, v.purpose)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[v.status]}>{v.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <VehicleListingActions v={v} onMarkAs={markAs} onDeleteRequest={setConfirmDelete} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <ul className="divide-y divide-gray-100 md:hidden">
            {listings.map((v) => (
              <li key={v._id} className="p-4">
                <div className="flex gap-3">
                  <img src={imageUrl(v.images?.[0])} className="h-14 w-20 shrink-0 rounded-lg object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-charcoal">{v.title}</p>
                    <p className="text-xs text-gray-500">{formatPrice(v.price, v.purpose)}</p>
                    <p className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge tone={statusTone[v.status]}>{v.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <VehicleListingActions v={v} onMarkAs={markAs} onDeleteRequest={setConfirmDelete} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete listing?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          This will permanently remove "{confirmDelete?.title}" from KigaliHomes. This can't be undone.
        </p>
      </Modal>
    </div>
  );
}
