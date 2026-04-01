import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { BarChart3, Clock, LayoutDashboard, Settings, Activity, Lightbulb, Layers, Trophy } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentFoundry V2 Tracker',
  description: 'Local Fitbit for AI Coding Agents',
};

import { SidebarProfile } from '@/components/SidebarProfile';

function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border text-white">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          AgentFoundry
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group">
          <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          Overview
        </Link>

        <Link href="/costs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group">
          <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          Costs
        </Link>

        <Link href="/performance" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group">
          <Activity className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          Performance
        </Link>
        
        <Link href="/performance/benchmarks" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group border-l-2 border-transparent hover:border-accent/50">
          <Trophy className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          Leaderboard
        </Link>

        <Link href="/performance/swarm" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group border-l-2 border-transparent hover:border-yellow-500/50">
          <Layers className="h-4 w-4 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
          Live Swarm
        </Link>

        <Link href="/insights" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group">
          <Lightbulb className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          Insights
        </Link>

        <Link href="/history" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-secondary hover:text-white transition-all group">
          <Clock className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          History
        </Link>
      </nav>

      <div className="px-4 py-2 border-t border-border">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-secondary hover:text-white transition-all group">
          <Settings className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          Settings
        </Link>
      </div>

      <SidebarProfile />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-slate-900 text-slate-50 flex h-screen overflow-hidden`}>
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-8">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
