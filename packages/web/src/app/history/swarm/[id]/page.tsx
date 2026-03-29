import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { Layers, ArrowLeft, Bot, Zap, DollarSign, FileCode } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function SwarmDetailPage({ params }: Props) {
    const { id } = await params;
    const swarm = await statsService.getSwarm(id);

    if (!swarm) {
        return notFound();
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center gap-4 mt-4">
                <Link href="/history" className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Layers className="w-6 h-6 text-yellow-500" />
                        Swarm Session: {id.split('_')[1] || id}
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs">
                        {new Date(swarm.startTime).toLocaleString()} — {swarm.endTime ? new Date(swarm.endTime).toLocaleTimeString() : 'Active'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bento-card p-6 flex flex-col gap-2 border-l-4 border-l-accent">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-mono uppercase tracking-wider">Total Agents</span>
                    </div>
                    <div className="text-3xl font-bold font-mono tracking-tighter">{swarm.sessions.length}</div>
                </div>

                <div className="bento-card p-6 flex flex-col gap-2 border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-mono uppercase tracking-wider">Total Cost</span>
                    </div>
                    <div className="text-3xl font-bold font-mono tracking-tighter text-emerald-400">
                        ${swarm.totalCost.toFixed(4)}
                    </div>
                </div>

                <div className="bento-card p-6 flex flex-col gap-2 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileCode className="w-4 h-4" />
                        <span className="text-xs font-mono uppercase tracking-wider">Files Touched</span>
                    </div>
                    <div className="text-3xl font-bold font-mono tracking-tighter">{swarm.totalFiles}</div>
                </div>

                <div className="bento-card p-6 flex flex-col gap-2 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-mono uppercase tracking-wider">Efficiency</span>
                    </div>
                    <div className="text-3xl font-bold font-mono tracking-tighter text-purple-400">
                        High
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-muted-foreground pl-1 border-l-2 border-accent">
                    Agent Coordination
                </h3>
                <div className="bento-card overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary/30 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">Agent</th>
                                <th className="px-6 py-4 text-left font-medium">Task</th>
                                <th className="px-6 py-4 text-left font-medium">Duration</th>
                                <th className="px-6 py-4 text-left font-medium">Quality</th>
                                <th className="px-6 py-4 text-left font-medium">Files</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {swarm.sessions.map((session: any) => (
                                <tr key={session.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-bold text-accent capitalize border border-accent/20 bg-accent/5 px-2 py-0.5 rounded">
                                            {session.agentName.replace('-code', '')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {session.taskHint || session.taskType || 'general'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                                        {session.durationSeconds}s
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {session.quality ? (
                                            <div className="flex items-center gap-2 text-xs font-mono">
                                                <span className={`status-dot ${session.quality.testsFailed === 0 ? 'success' : 'error'}`}></span>
                                                {session.quality.testsPassed} / {session.quality.testsPassed + session.quality.testsFailed}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                        {session.gitSnapshot ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-500">+{session.gitSnapshot.linesAdded}</span>
                                                <span className="text-rose-500">-{session.gitSnapshot.linesRemoved}</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
