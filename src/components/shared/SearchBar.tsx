import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  resultsCount?: { filtered: number; total: number };
}

/**
 * Reusable SearchBar component with optional filtering
 * Provides search input with clear button and optional filter dropdown
 */
const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder,
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder,
  resultsCount,
}) => {
  return (
    <div className="search-bar flex gap-4 items-center mb-5">
      {/* Search input */}
      <div className="search-input-wrapper flex-1 relative flex items-center">
        <span className="search-icon absolute left-3 text-tertiary">🔍</span>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input w-full pl-10 pr-10 py-2 rounded border border-divider bg-surface text-primary-900 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="clear-search absolute right-3 bg-none border-0 cursor-pointer text-lg text-tertiary p-0"
            aria-label="Καθαρισμός"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter select */}
      {filterOptions && onFilterChange && (
        <select
          value={filterValue || ''}
          onChange={(e) => onFilterChange(e.target.value)}
          className="filter-select px-2 py-2 rounded border border-divider bg-surface text-primary-900 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">{filterPlaceholder}</option>
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Results count */}
      {resultsCount && (
        <div className="results-count" style={{ fontSize: '0.9rem', color: '#666', whiteSpace: 'nowrap' }}>
          {resultsCount.filtered} / {resultsCount.total}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
