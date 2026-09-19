import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const propertyTypes = ['house', 'apartment', 'villa', 'commercial', 'plot'];
const bedroomOptions = [1, 2, 3, 4, 5];

function FilterFields({ filters, onChange }) {
  return (
    <div className="space-y-5">
      <Select label="Purpose" value={filters.purpose} onChange={(e) => onChange('purpose', e.target.value)}>
        <option value="">All</option>
        <option value="rent">Rent</option>
        <option value="sale">Sale</option>
      </Select>

      <Select label="Property type" value={filters.propertyType} onChange={(e) => onChange('propertyType', e.target.value)}>
        <option value="">Any type</option>
        {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
      </Select>

      <Input label="Location" value={filters.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Kimihurura" />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-charcoal">Price range (RWF)</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange('minPrice', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus-ring focus:border-forest-500"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange('maxPrice', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus-ring focus:border-forest-500"
          />
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-charcoal">Bedrooms (min)</span>
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange('bedrooms', filters.bedrooms === String(n) ? '' : String(n))}
              className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
                filters.bedrooms === String(n)
                  ? 'border-forest-600 bg-forest-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-forest-300'
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          checked={filters.furnished === 'true'}
          onChange={(e) => onChange('furnished', e.target.checked ? 'true' : '')}
          className="h-4 w-4 rounded border-gray-300 text-forest-600 focus-ring"
        />
        Furnished only
      </label>
    </div>
  );
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    purpose: searchParams.get('purpose') || '',
    propertyType: searchParams.get('propertyType') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnished: searchParams.get('furnished') || '',
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const fetchProperties = (targetPage = page) => {
    setLoading(true);
    const params = { sort, page: targetPage };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api
      .get('/properties', { params })
      .then((res) => {
        setProperties(res.data.properties);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  };

  // Initial load + whenever sort or page changes (filters apply only via the button).
  useEffect(() => {
    fetchProperties(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page]);

  const applyFilters = () => {
    setPage(1);
    setMobileFiltersOpen(false);
    const params = { sort, page: '1' };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    setSearchParams(params);
    fetchProperties(1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > pages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl text-charcoal sm:text-2xl">Properties</h1>
          <p className="mt-0.5 text-sm text-gray-500">{loading ? 'Searching…' : `${total} result${total === 1 ? '' : 's'} found`}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile-only: opens the filter panel as a modal */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-charcoal hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus-ring"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop-only filter sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <FilterFields filters={filters} onChange={updateFilter} />
            <Button className="mt-6 w-full" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </aside>

        {/* Results grid — responsive column count */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState title="No properties found" description="Try adjusting your filters or search a different location." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
              </div>

              {pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 text-sm text-gray-500">Page {page} of {pages}</span>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= pages}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter panel */}
      <Modal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
        footer={<Button className="w-full" onClick={applyFilters}>Apply Filters</Button>}
      >
        <FilterFields filters={filters} onChange={updateFilter} />
      </Modal>
    </div>
  );
}
