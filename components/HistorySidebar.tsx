import React from 'react';
import type { HistoryEntry } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';

interface HistorySidebarProps {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onLoad, onClear, isOpen, onClose }) => {
  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-slate-800/60 backdrop-blur-xl border-r border-slate-700/50 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
            <div className="flex items-center gap-3">
                <HistoryIcon className="w-6 h-6 text-slate-300" />
                <h2 className="text-lg font-['Inter'] text-slate-200">Історія пошуків</h2>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-slate-700">
                <XIcon className="w-6 h-6 text-slate-300"/>
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-2">
            {history.length === 0 ? (
                <p className="text-center text-slate-500 p-4 text-sm">Історія пошуків порожня.</p>
            ) : (
                <ul className="space-y-2">
                    {history.map(entry => (
                        <li key={entry.id}>
                            <button 
                                onClick={() => onLoad(entry)}
                                className="w-full text-left p-3 rounded-md hover:bg-slate-700/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                            >
                                <p className="font-bold text-slate-200 truncate">{entry.target}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(entry.timestamp).toLocaleString('uk-UA')}
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {history.length > 0 && (
            <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
                <button
                    onClick={onClear}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-2 px-4 rounded-md transition-all duration-200"
                >
                    <TrashIcon className="w-5 h-5"/>
                    <span>Очистити історію</span>
                </button>
            </div>
        )}
      </aside>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 z-30 lg:hidden" aria-hidden="true" />}
    </>
  );
};