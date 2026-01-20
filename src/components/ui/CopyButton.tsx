// =====================================================
// components/ui/CopyButton.tsx
// =====================================================

import React, { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  successMessage?: string;
  variant?: 'default' | 'warning'; // ✅ Added this
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  label = 'Copy', 
  successMessage = 'Copied!', 
  variant = 'default', // ✅ Added default
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // ✅ Style logic
  const baseStyles = "px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variantStyles = variant === 'warning' 
    ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200";

  return (
    <button
      onClick={handleCopy}
      className={`${baseStyles} ${variantStyles} ${className}`}
      type="button"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">{successMessage}</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm">{label}</span>
        </>
      )}
    </button>
  );
};