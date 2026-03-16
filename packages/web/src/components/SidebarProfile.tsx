'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LogOut,
  User as UserIcon,
  ChevronUp,
  Shield,
  Users,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function SidebarProfile() {
  const { user, activeTeam, availableUsers, availableTeams, switchUser, switchTeam, loading } = useAuth();

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

  return (
    <div className="mt-auto px-2 py-4 border-t border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group">
            {user ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-accent group-hover:border-accent/40">
                <UserIcon className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 group-hover:border-slate-500">
                <Shield className="h-4 w-4" />
              </div>
            )}

            <div className="flex-1 text-left overflow-hidden">
              <p className="truncate text-xs font-bold text-foreground">
                {user ? user.name || user.email.split('@')[0] : 'Solo Mode'}
              </p>
              <p className="truncate text-[10px] text-muted-foreground uppercase font-mono">
                {user ? (activeTeam ? activeTeam.name : 'No active team') : 'Local only'}
              </p>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl h-auto max-h-96 overflow-y-auto">

          <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase flex items-center gap-2">
            <UserIcon className="h-3 w-3" /> Switch User
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => switchUser(null)}
            className="cursor-pointer focus:bg-secondary flex items-center justify-between"
          >
            <span>Solo Mode</span>
            {!user && <span className="h-2 w-2 bg-emerald-500 rounded-full" />}
          </DropdownMenuItem>
          {availableUsers.map(u => (
            <DropdownMenuItem
              key={u.id}
              onClick={() => switchUser(u.id)}
              className="cursor-pointer focus:bg-secondary flex items-center justify-between"
            >
              <span>{u.name || u.email}</span>
              {user?.id === u.id && <span className="h-2 w-2 bg-accent rounded-full" />}
            </DropdownMenuItem>
          ))}

          {user && availableTeams.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase flex items-center gap-2">
                <Users className="h-3 w-3" /> Switch Team
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => switchTeam(null)}
                className="cursor-pointer focus:bg-secondary flex items-center justify-between"
              >
                <span>Personal</span>
                {!activeTeam && <span className="h-2 w-2 bg-emerald-500 rounded-full" />}
              </DropdownMenuItem>
              {availableTeams.map(t => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => switchTeam(t.id)}
                  className="cursor-pointer focus:bg-secondary flex items-center justify-between"
                >
                  <span>{t.name}</span>
                  {activeTeam?.id === t.id && <span className="h-2 w-2 bg-accent rounded-full" />}
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator className="bg-border" />

          <Link href="/teams">
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-secondary">
              <Settings className="h-4 w-4" />
              <span>Manage Profiles</span>
            </DropdownMenuItem>
          </Link>

          {user && (
            <>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => switchUser(null)}
                className="flex items-center gap-2 cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit Team Mode</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
