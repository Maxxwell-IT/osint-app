import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card from toggling if button is inside a header
    e.preventDefault(); // Prevent navigation if button is inside a link
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-cyan-500/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <CheckIcon className="w-5 h-5 text-green-400" />
      ) : (
        <ClipboardIcon className="w-5 h-5 text-cyan-300/70 transition-transform duration-200 ease-in-out group-hover:scale-125" />
      )}
    </button>
  );
};