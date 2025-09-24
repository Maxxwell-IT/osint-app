import React from 'react';
import type { OSINTResult } from '../types';
import { TelegramIcon } from './icons/TelegramIcon';

interface TelegramShareButtonProps {
  results: OSINTResult;
  target: string;
}

export const TelegramShareButton: React.FC<TelegramShareButtonProps> = ({ results, target }) => {
  const handleShare = () => {
    const text = `
*DeepSerch: Звіт по запиту "${target}"*

*Зведення:*
${results.summary}

_Згенеровано DeepSerch._
    `;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleShare}
      className="flex-shrink-0 flex items-center gap-2 bg-slate-700 text-slate-300 hover:bg-slate-600 px-4 py-2 text-sm font-bold rounded-md transition-colors duration-200"
      title="Поділитися в Telegram"
    >
      <TelegramIcon className="w-5 h-5" />
      <span>Поділитися</span>
    </button>
  );
};