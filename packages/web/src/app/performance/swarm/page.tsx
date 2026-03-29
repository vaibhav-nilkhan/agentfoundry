import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { Layers, Bot, Zap, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SwarmViewPage() {
    const { swarms, solos } = await statsService.getActiveSwarms();
    const totalActive = swarms.reduce((sum, s) => sum + s.sessions.length, 0) + solos.length;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2 mt-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <Layers className="w-8 h-8 text-yellow-500 animate-pulse" />
                    Live Swarm Monitor
                </h1>
                <p className="text-muted-foreground font-mono text-sm">
                    REAL_TIME_ORCHESTRATION: {totalActive} AGENTS_DETECTED
                </p>
            </div>

            {totalActive === 0 && (
                <div className="bento-card p-20 flex flex-col items-center justify-center text-center gap-4">
                    <Bot className="w-12 h-12 text-muted-foreground opacity-20" />
                    <div className="space-y-1">
                        <p className="text-lg font-medium text-foreground">Workspace is Quiet</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Start an agent like Claude Code or Codex to see live swarm activity here.
                        </p>
                    </div>
                </div>
            )}

            {swarms.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-yellow-500/80 pl-1 border-l-2 border-yellow-500/50">
                        Active Swarms ({swarms.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {swarms.map((swarm) => (
                            <div key={swarm.id} className="bento-card border-l-4 border-l-yellow-500 p-0 overflow-hidden">
                                <div className="bg-yellow-500/5 px-6 py-4 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                                        <span className="font-mono font-bold text-yellow-500">ID: {swarm.id.split('_')[1]}</span>
                                        <span className="text-xs text-muted-foreground ml-4">
                                            Started {new Date(swarm.startTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <Link 
                                        href={`/history/swarm/${swarm.id}`}
                                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                                    >
                                        VIEW_LIFETIME_METRICS <Zap className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {swarm.sessions.map((session) => (
                                            <div key={session.id} className="bg-secondary/20 rounded-lg p-4 border border-border flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-accent uppercase px-2 py-0.5 bg-accent/10 rounded">
                                                        {session.agentName.replace('-code', '')}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground">PID: {session.id.slice(0, 8)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground italic truncate">
                                                        {session.taskHint || 'Thinking...'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50">
                                                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        READY
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {solos.length > 0 && (
                <div className="space-y-6 pt-4">
                    <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground pl-1 border-l-2 border-border">
                        Solo Agents ({solos.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {solos.map((session) => (
                            <div key={session.id} className="bento-card p-4 border border-border flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-bold text-foreground uppercase">
                                            {session.agentName.replace('-code', '')}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground">PID: {session.id.slice(0, 8)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground italic truncate">
                                    {session.taskHint || 'Processing...'}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">Running solo</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)}s
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
