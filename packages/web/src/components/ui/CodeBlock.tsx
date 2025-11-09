'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({ code, language: _language = 'typescript', title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('terminal', className)}>
      <div className="terminal-header">
        <div className="flex items-center gap-2 flex-1">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          {title && <span className="text-slate-400 text-xs ml-2">{title}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-accent transition-colors px-2 py-1 rounded border border-slate-700 hover:border-accent/50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto">
        <code className="text-slate-300">{code}</code>
      </pre>
    </div>
  );
}

interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        'bg-slate-800 text-accent px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700',
        className
      )}
    >
      {children}
    </code>
  );
}
