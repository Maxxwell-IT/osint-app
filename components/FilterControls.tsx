import React from 'react';

export interface FilterOption {
  key: string;
  label: string;
  count: number;
}

interface FilterControlsProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterKey: string) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ filters, activeFilter, onFilterChange }) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 glass-card rounded-lg mb-4">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors duration-200 ${
          activeFilter === 'all'
            ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
            : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
        }`}
      >
        Всі
      </button>
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors duration-200 flex items-center gap-2 ${
            activeFilter === filter.key
              ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
          }`}
        >
          <span>{filter.label}</span>
          <span className={`text-xs rounded-full px-2 py-0.5 ${
             activeFilter === filter.key ? 'bg-black/20 text-white' : 'bg-black/30 text-cyan-200'
          }`}>{filter.count}</span>
        </button>
      ))}
    </div>
  );
};