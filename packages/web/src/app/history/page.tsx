import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { Clock } from 'lucide-react';

export default async function HistoryPage() {
    // For Phase 3, we default to no specific teamId yet (fetching all)
    // The service now expects: getHistory(teamId?: string, limit?: number, page?: number)
    const { sessions, total } = await statsService.getHistory(undefined, 50, 1);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mt-4 flex items-center gap-3">
                    <Clock className="w-8 h-8 text-accent" />
                    Session History
                </h1>
                <p className="text-muted-foreground font-mono text-sm">ARCHIVE_MODULE: {total} TOTAL_RECORDS_INDEXED</p>
            </div>

            <div className="bento-card overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary/30 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 text-left font-medium">Timestamp</th>
                            <th className="px-6 py-4 text-left font-medium">Agent</th>
                            <th className="px-6 py-4 text-left font-medium">Task Type</th>
                            <th className="px-6 py-4 text-left font-medium">Cost</th>
                            <th className="px-6 py-4 text-left font-medium">Lines Changed</th>
                            <th className="px-6 py-4 text-left font-medium">Quality</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                        {sessions.map((session: any) => (
                            <tr key={session.id} className="data-row-interactive">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                                    {new Date(session.startedAt).toLocaleString(undefined, {
                                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs font-bold text-accent capitalize border border-accent/20 bg-accent/5 px-2 py-0.5 rounded">
                                        {session.agentName.replace('-code', '')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">
                                    {session.taskType || 'general'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-mono font-bold">
                                    {session.cost ? `$${session.cost.costUsd.toFixed(4)}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {session.gitSnapshot ? (
                                        <div className="flex items-center gap-2 font-mono text-xs">
                                            <span className="text-emerald-500">+{session.gitSnapshot.linesAdded}</span>
                                            <span className="text-rose-500">-{session.gitSnapshot.linesRemoved}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground opacity-50">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {session.quality ? (
                                        <div className="flex items-center gap-2 text-xs text-foreground font-mono">
                                            <span className={`status-dot ${session.quality.testsFailed === 0 ? 'success' : 'error'}`}></span>
                                            {session.quality.testsPassed} / {session.quality.testsPassed + session.quality.testsFailed}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground opacity-50">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {sessions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-sm text-muted-foreground font-mono italic">
                                    No session telemetry available. Start a background tracking session to begin logging data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
