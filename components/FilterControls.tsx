import React from 'react';

export interface FilterOption {
  key: string;
  label: string;
  count: number;
}

interface FilterControlsProps {
  filters: FilterOption[];
  activeFilter: string;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ filters, activeFilter }) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 glass-card rounded-lg mb-4">
      <a
        href="#all"
        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 ease-in-out ${
          activeFilter === 'all'
            ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transform scale-105'
            : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transform hover:scale-105'
        }`}
      >
        Всі
      </a>
      {filters.map((filter) => (
        <a
          key={filter.key}
          href={`#${filter.key}`}
          className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 ease-in-out flex items-center gap-2 ${
            activeFilter === filter.key
              ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transform scale-105'
              : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transform hover:scale-105'
          }`}
        >
          <span>{filter.label}</span>
          <span className={`text-xs rounded-full px-2 py-0.5 ${
             activeFilter === filter.key ? 'bg-black/20 text-white' : 'bg-black/30 text-cyan-200'
          }`}>{filter.count}</span>
        </a>
      ))}
    </div>
  );
};