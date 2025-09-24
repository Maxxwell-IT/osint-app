import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSearch, isLoading }) => {
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