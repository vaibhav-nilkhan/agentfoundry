'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'error' | 'neutral';
  className?: string;
  isCurrency?: boolean;
}

export function MetricDisplay({
  label,
  value,
  subValue,
  trend,
  status,
  className,
  isCurrency = false,
}: MetricDisplayProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center text-sm font-medium text-muted-foreground">
        {status && (
          <span
            className={cn(
              'status-dot',
              status === 'success' && 'success',
              status === 'error' && 'error',
              status === 'neutral' && 'neutral'
            )}
          />
        )}
        {label}
      </div>
      
      <div className="flex items-baseline gap-2 mt-1">
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-3xl font-bold tracking-tight font-mono",
            "text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70"
          )}
        >
          {isCurrency && <span className="text-muted-foreground/50 mr-1">$</span>}
          {value}
        </motion.div>
        
        {subValue && (
          <div className="text-sm font-mono text-muted-foreground">
            {subValue}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-2 text-xs font-mono">
          {trend === 'up' && <span className="text-emerald-500">↑ Increasing</span>}
          {trend === 'down' && <span className="text-emerald-500">↓ Decreasing (Good)</span>}
          {trend === 'neutral' && <span className="text-slate-500">→ Stable</span>}
        </div>
      )}
    </div>
  );
}