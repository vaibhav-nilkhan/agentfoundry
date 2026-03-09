import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { BarChart3, Clock, LayoutDashboard, Settings, Activity, Lightbulb } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentFoundry V2 Tracker',
  description: 'Local Fitbit for AI Coding Agents',
};

function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-slate-950 border-r border-slate-800 text-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          AgentFoundry
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <LayoutDashboard className="h-5 w-5" />
          Overview
        </Link>

        <Link href="/costs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <BarChart3 className="h-5 w-5" />
          Costs
        </Link>

        <Link href="/performance" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Activity className="h-5 w-5" />
          Performance
        </Link>

        <Link href="/insights" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Lightbulb className="h-5 w-5" />
          Insights
        </Link>

        <Link href="/history" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Clock className="h-5 w-5" />
          History
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
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
