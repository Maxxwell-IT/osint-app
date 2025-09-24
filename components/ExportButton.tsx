import React from 'react';
import type { OSINTResult, GroundingChunk } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface ExportButtonProps {
  results: OSINTResult;
  sources: GroundingChunk[];
  target: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ results, sources, target }) => {
  const handleExport = () => {
    // Sanitize the target for a valid filename
    const sanitizedTarget = target.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `OSINT-следчий_report_${sanitizedTarget || 'export'}.json`;

    const dataToExport = {
      investigationTarget: target,
      results,
      sources,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex-shrink-0 flex items-center gap-2 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 px-4 py-2 text-sm font-bold rounded-md transition-colors duration-200"
      title="Експортувати результати у JSON"
    >
      <DownloadIcon className="w-5 h-5" />
      <span>Експортувати</span>
    </button>
  );
};
