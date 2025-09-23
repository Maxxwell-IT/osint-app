import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  query: string;
  setQuery: (query: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading, query, setQuery }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 md:gap-4 items-center glass-card p-3 rounded-lg glowing-border">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введіть ім'я користувача, email або домен..."
        className="w-full bg-transparent text-cyan-200 placeholder-cyan-100/40 text-lg focus:outline-none p-2"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-md transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
      >
        <SearchIcon className="w-5 h-5" />
        <span>{isLoading ? 'Розслідування...' : 'Дослідити'}</span>
      </button>
    </form>
  );
};