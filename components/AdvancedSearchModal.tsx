
import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { XIcon } from './icons/XIcon';

interface AdvancedSearchModalProps {
  onClose: () => void;
  onSearch: (query: string) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({ onClose, onSearch }) => {
  const [allWords, setAllWords] = useState('');
  const [anyWords, setAnyWords] = useState('');
  const [noneWords, setNoneWords] = useState('');

  const constructQuery = () => {
    let queryParts: string[] = [];
    if (allWords.trim()) {
      queryParts.push(allWords.trim().split(/\s+/).map(word => `"${word}"`).join(' AND '));
    }
    if (anyWords.trim()) {
      queryParts.push(`(${anyWords.trim().split(/\s+/).map(word => `"${word}"`).join(' OR ')})`);
    }
    if (noneWords.trim()) {
      queryParts.push(noneWords.trim().split(/\s+/).map(word => `NOT "${word}"`).join(' '));
    }
    return queryParts.join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = constructQuery();
    if (query) {
      onSearch(query);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-search-title"
    >
      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6 md:p-8 max-w-lg w-full m-4 shadow-2xl shadow-blue-500/10">
        <div className="flex items-center justify-between mb-6">
          <h2 id="advanced-search-title" className="text-2xl font-['Inter'] font-bold text-slate-100">
            Розширений пошук
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700/60 transition-colors">
            <XIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="all-words" className="block text-sm font-medium text-slate-300 mb-2">
              Містить всі ці слова (AND)
            </label>
            <input
              id="all-words"
              type="text"
              value={allWords}
              onChange={(e) => setAllWords(e.target.value)}
              className="w-full bg-slate-900/70 border border-slate-700 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="e.g., Ivan Franko"
            />
          </div>
          <div>
            <label htmlFor="any-words" className="block text-sm font-medium text-slate-300 mb-2">
              Містить будь-яке з цих слів (OR)
            </label>
            <input
              id="any-words"
              type="text"
              value={anyWords}
              onChange={(e) => setAnyWords(e.target.value)}
              className="w-full bg-slate-900/70 border border-slate-700 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="e.g., Kyiv Lviv"
            />
          </div>
          <div>
            <label htmlFor="none-words" className="block text-sm font-medium text-slate-300 mb-2">
              Не містить жодного з цих слів (NOT)
            </label>
            <input
              id="none-words"
              type="text"
              value={noneWords}
              onChange={(e) => setNoneWords(e.target.value)}
              className="w-full bg-slate-900/70 border border-slate-700 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="e.g., accountant poet"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <SearchIcon className="w-5 h-5" />
              <span>Шукати</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
