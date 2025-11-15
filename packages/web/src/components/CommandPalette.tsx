'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, FileText, Home, Settings, Users, Package, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Global Command Menu"
      className={cn(
        'fixed top-[20%] left-1/2 -translate-x-1/2 z-50',
        'w-full max-w-[640px]',
        'bg-popover text-popover-foreground',
        'border border-border rounded-xl shadow-2xl',
        'overflow-hidden'
      )}
    >
      <div className="flex items-center border-b border-border px-4">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Type a command or search..."
          className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">ESC</span>
        </kbd>
      </div>

      <Command.List className="max-h-[400px] overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
          No results found.
        </Command.Empty>

        <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/'))}
            icon={<Home className="w-4 h-4" />}
          >
            Home
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/marketplace'))}
            icon={<Package className="w-4 h-4" />}
          >
            Marketplace
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/showcase'))}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Skills Showcase
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/admin'))}
            icon={<Settings className="w-4 h-4" />}
          >
            Admin Dashboard
          </CommandItem>
        </Command.Group>

        <Command.Separator className="my-1 h-px bg-border" />

        <Command.Group heading="Skills" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/skill/error-recovery-orchestrator'))}
            icon={<FileText className="w-4 h-4" />}
          >
            Error Recovery Orchestrator
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/skill/cost-predictor-optimizer'))}
            icon={<FileText className="w-4 h-4" />}
          >
            Cost Predictor & Optimizer
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/skill/multi-agent-orchestrator'))}
            icon={<FileText className="w-4 h-4" />}
          >
            Multi-Agent Orchestrator
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/skill/decision-explainer'))}
            icon={<FileText className="w-4 h-4" />}
          >
            Decision Explainer
          </CommandItem>
        </Command.Group>

        <Command.Separator className="my-1 h-px bg-border" />

        <Command.Group heading="Admin" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/admin/users'))}
            icon={<Users className="w-4 h-4" />}
          >
            Manage Users
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/admin/skills'))}
            icon={<Package className="w-4 h-4" />}
          >
            Manage Skills
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/admin/analytics'))}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            View Analytics
          </CommandItem>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

interface CommandItemProps {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
}

function CommandItem({ children, onSelect, icon }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        'transition-colors'
      )}
    >
      {icon}
      <span>{children}</span>
    </Command.Item>
  );
}
