const propertyTypes = ['house', 'apartment', 'villa', 'commercial', 'plot'];

export default function FilterSidebar({ filters, setFilters, onApply }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-charcoal">Purpose</h4>
        <div className="flex gap-2">
          {['', 'rent', 'sale'].map((p) => (
            <button
              key={p || 'all'}
              onClick={() => update('purpose', p)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                filters.purpose === p ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {p === '' ? 'All' : p === 'rent' ? 'Rent' : 'Sale'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-charcoal">Property type</h4>
        <select
          value={filters.propertyType || ''}
          onChange={(e) => update('propertyType', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm capitalize"
        >
          <option value="">Any type</option>
          {propertyTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-charcoal">Location</h4>
        <input
          value={filters.location || ''}
          onChange={(e) => update('location', e.target.value)}
          placeholder="e.g. Remera"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-charcoal">Price range (RWF)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value)}
            className="w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-charcoal">Bedrooms (min)</h4>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => update('bedrooms', String(n))}
              className={`h-8 w-8 rounded-lg text-xs font-medium ${
                filters.bedrooms === String(n) ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-charcoal">Furnished</h4>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={filters.furnished === 'true'}
            onChange={(e) => update('furnished', e.target.checked ? 'true' : '')}
            className="h-4 w-4 rounded border-gray-300 text-forest-600 focus:ring-forest-500"
          />
          Furnished only
        </label>
      </div>

      <button
        onClick={onApply}
        className="w-full rounded-lg bg-forest-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-700"
      >
        Apply Filters
      </button>
    </div>
  );
}
