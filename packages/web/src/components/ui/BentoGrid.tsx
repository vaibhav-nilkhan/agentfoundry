'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  title,
  description,
  header,
  icon,
  children,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'row-span-1 rounded-xl group/bento transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-card border-slate-200 dark:border-border border bg-white justify-between flex flex-col space-y-4 overflow-hidden relative',
        // Subtle overhead light effect via gradient
        'bg-gradient-to-b from-white to-transparent dark:from-[rgba(255,255,255,0.03)] dark:to-transparent',
        className
      )}
    >
      {/* Background Glow Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-accent/5 to-transparent dark:from-accent/10 dark:to-transparent z-0" />

      <div className="relative z-10 flex-1">
        {header && <div className="mb-4">{header}</div>}
        
        <div className="group-hover/bento:translate-x-1 transition duration-200">
          {icon && <div className="mb-2 text-muted-foreground">{icon}</div>}
          
          {(title || description) && (
            <div className="mb-4">
              {title && (
                <div className="font-sans font-bold text-foreground mb-1 mt-2">
                  {title}
                </div>
              )}
              {description && (
                <div className="font-sans font-normal text-muted-foreground text-xs">
                  {description}
                </div>
              )}
            </div>
          )}
          
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}