import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { RowSkeleton } from '../../components/Skeleton';
import { formatPrice, imageUrl } from '../../utils/format';
import Modal from '../../components/Modal';

const statusTone = { pending: 'gold', approved: 'green', rejected: 'red', sold: 'gray', rented: 'gray' };

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/properties/mine/all').then((res) => setListings(res.data.properties)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/properties/${confirmDelete._id}`);
      toast.success('Listing deleted');
      setListings((l) => l.filter((x) => x._id !== confirmDelete._id));
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setConfirmDelete(null);
    }
  };

  const markAs = async (property, status) => {
    try {
      await api.put(`/properties/${property._id}`, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-charcoal">My Listings</h1>
        <Link to="/dashboard/listings/new"><Button>Add Property</Button></Link>
      </div>

      {loading ? (
        <div className="space-y-2"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
      ) : listings.length === 0 ? (
        <EmptyState icon={Building2} title="No listings yet" description="Add your first property to start reaching home seekers." action={<Link to="/dashboard/listings/new"><Button>Add Property</Button></Link>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((l) => (
                <tr key={l._id}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <img src={imageUrl(l.images?.[0])} className="h-10 w-14 rounded-lg object-cover" alt="" />
                    <span className="font-medium text-charcoal">{l.title}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(l.price, l.purpose)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[l.status]}>{l.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {l.status === 'approved' && l.purpose === 'sale' && (
                        <button onClick={() => markAs(l, 'sold')} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50">Mark Sold</button>
                      )}
                      {l.status === 'approved' && l.purpose === 'rent' && (
                        <button onClick={() => markAs(l, 'rented')} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50">Mark Rented</button>
                      )}
                      <Link to={`/dashboard/listings/${l._id}/edit`} className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"><Pencil size={14} /></Link>
                      <button onClick={() => setConfirmDelete(l)} className="rounded-lg border border-gray-200 p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
