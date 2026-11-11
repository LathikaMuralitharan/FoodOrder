import type { FilterState } from '../../types';

interface FilterPanelProps {
  filters: FilterState;
  cuisines: string[];
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function FilterPanel({ filters, cuisines, onChange, onClear }: FilterPanelProps) {
  const hasActiveFilters = Boolean(
    filters.cuisineType ||
    filters.minRating !== null ||
    filters.maxPrepTime !== null ||
    filters.showClosed
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-2xs">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cuisine Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cuisineType" className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Cuisine
          </label>
          <select
            id="cuisineType"
            value={filters.cuisineType ?? ''}
            onChange={(e) => onChange({ ...filters, cuisineType: e.target.value || null })}
            className="rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-medium text-gray-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Cuisines</option>
            {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Rating Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="minRating" className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Min Rating
          </label>
          <select
            id="minRating"
            value={filters.minRating?.toString() ?? ''}
            onChange={(e) => onChange({ ...filters, minRating: e.target.value ? parseFloat(e.target.value) : null })}
            className="rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-medium text-gray-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Any Rating</option>
            {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => (
              <option key={r} value={r}>{r.toFixed(1)}+ Stars</option>
            ))}
          </select>
        </div>

        {/* Prep Time Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxPrepTime" className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Max Prep Time
          </label>
          <select
            id="maxPrepTime"
            value={filters.maxPrepTime?.toString() ?? ''}
            onChange={(e) => onChange({ ...filters, maxPrepTime: e.target.value ? parseInt(e.target.value) : null })}
            className="rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-medium text-gray-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Any Prep Time</option>
            {[10, 15, 20, 25, 30, 45, 60].map(t => (
              <option key={t} value={t}>Under {t} mins</option>
            ))}
          </select>
        </div>

        {/* Show Closed Checkbox & Clear */}
        <div className="flex flex-col justify-end gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Availability
          </span>
          <div className="flex h-[42px] items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
              <input
                id="showClosed"
                type="checkbox"
                checked={filters.showClosed}
                onChange={(e) => onChange({ ...filters, showClosed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include closed</span>
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline ml-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            Filtered view active
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
