import { useEffect, useState } from 'react';
import { Users, Building2, Clock, CheckCircle, Star, Flag } from 'lucide-react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.stats));
  }, []);

  if (!stats) return <LoadingSpinner />;

  const maxListings = Math.max(...stats.listingsOverTime.map((d) => d.count), 1);
  const maxUsers = Math.max(...stats.usersOverTime.map((d) => d.count), 1);
  const rentSaleTotal = stats.rentVsSale.rent + stats.rentVsSale.sale || 1;

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Overview of KigaliHomes activity.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} tone="green" />
        <StatsCard label="Total Properties" value={stats.totalProperties} icon={Building2} tone="green" />
        <StatsCard label="Pending" value={stats.pendingProperties} icon={Clock} tone="gold" />
        <StatsCard label="Approved" value={stats.approvedProperties} icon={CheckCircle} tone="green" />
        <StatsCard label="Featured" value={stats.featuredProperties} icon={Star} tone="gold" />
        <StatsCard label="Open Reports" value={stats.reportedProperties} icon={Flag} tone="red" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg text-charcoal">Listings over time</h2>
          <div className="flex h-40 items-end gap-2">
            {stats.listingsOverTime.map((d) => (
              <div key={d._id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-forest-500"
                  style={{ height: `${(d.count / maxListings) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-gray-400">{d._id.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg text-charcoal">Users over time</h2>
          <div className="flex h-40 items-end gap-2">
            {stats.usersOverTime.map((d) => (
              <div key={d._id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gold-400"
                  style={{ height: `${(d.count / maxUsers) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-gray-400">{d._id.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg text-charcoal">Rent vs Sale</h2>
          <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
            <div className="bg-forest-500" style={{ width: `${(stats.rentVsSale.rent / rentSaleTotal) * 100}%` }} />
            <div className="bg-gold-400" style={{ width: `${(stats.rentVsSale.sale / rentSaleTotal) * 100}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs text-gray-500">
            <span>Rent: {stats.rentVsSale.rent}</span>
            <span>Sale: {stats.rentVsSale.sale}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg text-charcoal">Property types</h2>
          <ul className="space-y-2">
            {stats.propertyTypes.map((t) => (
              <li key={t._id} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-600">{t._id}</span>
                <span className="font-medium text-charcoal">{t.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
