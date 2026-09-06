import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import { RowSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { Flag } from 'lucide-react';

const statusTone = { pending: 'gold', reviewing: 'green', resolved: 'green', rejected: 'red' };
const reasonLabels = {
  fake: 'Fake property', wrong_info: 'Wrong information', scam: 'Scam',
  wrong_price: 'Wrong price', inappropriate: 'Inappropriate content', other: 'Other',
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/reports', { params: { status: statusFilter || undefined } }).then((res) => setReports(res.data.reports)).finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const updateStatus = async (report, status) => {
    try {
      await api.put(`/admin/reports/${report._id}`, { status });
      toast.success('Report updated');
      setReports((list) => list.map((r) => (r._id === report._id ? { ...r, status } : r)));
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal">Reports</h1>

      <div className="mt-5 flex gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-4"><RowSkeleton /><RowSkeleton /></div>
        ) : reports.length === 0 ? (
          <div className="p-4"><EmptyState icon={Flag} title="No reports" description="Reported listings will appear here." /></div>
        ) : (
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 font-medium text-charcoal">{r.property?.title || 'Deleted property'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.reporter?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{reasonLabels[r.reason]}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r, e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
