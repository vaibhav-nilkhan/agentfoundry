'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navigation() {
  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <nav className="fixed top-0 left-0 right-0 z-50 glass" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="AgentFoundry home">
            <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center transition-smooth group-hover:scale-105">
              <span className="text-background font-bold text-sm">AF</span>
            </div>
            <span className="text-lg font-semibold">
              AgentFoundry
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1" role="menu">
            <Link
              href="/skills/error-recovery-orchestrator"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-smooth focus-ring-enhanced"
              role="menuitem"
            >
              Product
            </Link>
            <Link
              href="/guides"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-smooth focus-ring-enhanced"
              role="menuitem"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-smooth focus-ring-enhanced"
              role="menuitem"
            >
              Pricing
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/guides">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
