
import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';
import { AdjustmentsIcon } from './icons/AdjustmentsIcon';

interface ChatInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onAdvancedSearchClick: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSearch, isLoading, onAdvancedSearchClick }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
        onSearch(query);
        setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 md:gap-4 items-center bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/80 transition-shadow duration-200">
       <button
        type="button"
        onClick={onAdvancedSearchClick}
        disabled={isLoading}
        className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-700/60 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Розширений пошук"
        title="Розширений пошук"
      >
        <AdjustmentsIcon className="w-6 h-6" />
      </button>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введіть запит для аналізу..."
        className="w-full bg-transparent text-gray-200 placeholder-gray-400/40 text-lg focus:outline-none p-2"
        disabled={isLoading}
        autoFocus
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105"
        aria-label="Надіслати запит"
      >
        {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
        ) : (
            <SendIcon className="w-6 h-6" />
        )}
      </button>
    </form>
  );
};
