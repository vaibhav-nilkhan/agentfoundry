'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  User as UserIcon, 
  ChevronUp, 
  Shield, 
  Users 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SidebarProfile() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <Shield className="h-3 w-3" />
          Solo Mode
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto px-2 py-4 border-t border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-accent group-hover:border-accent/40">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="truncate text-xs font-bold text-foreground">
                {user.email?.split('@')[0]}
              </p>
              <p className="truncate text-[10px] text-muted-foreground uppercase font-mono">
                Team Member
              </p>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
          <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase">Account</DropdownMenuLabel>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-secondary">
            <UserIcon className="h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-secondary">
            <Users className="h-4 w-4" />
            <span>Switch Team</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem 
            onClick={() => signOut()}
            className="flex items-center gap-2 cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
