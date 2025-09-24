import React from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ErrorDisplayProps {
  message: string;
  onClose: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <div className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 rounded-lg p-6 md:p-8 max-w-md w-full m-4 border-2 border-red-500/50 shadow-red-500/20">
        <div className="flex flex-col items-center text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
          <h2 id="error-title" className="text-2xl font-['Inter'] text-red-300">
            Помилка аналізу
          </h2>
          <p id="error-description" className="mt-2 text-red-100/90">
            {message}
          </p>
          <button
            onClick={onClose}
            className="mt-6 bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-8 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};