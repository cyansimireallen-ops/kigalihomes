import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import PropertyCard from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import api from '../api/axios';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(Object.fromEntries(searchParams.entries()));
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ properties: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters, sort, page };
    Object.keys(params).forEach((k) => (params[k] === '' || params[k] == null) && delete params[k]);
    api
      .get('/properties', { params })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [filters, sort, page]);

  const applyFilters = () => {
    setPage(1);
    setSearchParams({ ...filters });
    setMobileFiltersOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">{data.total} results found</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="hidden lg:col-span-1 lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} onApply={applyFilters} />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : data.properties.length === 0 ? (
            <EmptyState title="No properties found" description="Try adjusting your filters or search a different location." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.properties.map((p) => <PropertyCard key={p._id} property={p} />)}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}><X /></button>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} onApply={applyFilters} />
          </div>
        </div>
      )}
    </div>
  );
}
