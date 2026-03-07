import { statsService } from '@/lib/services/stats.service';
import { Code2, BugPlay } from 'lucide-react';

export default async function HistoryPage() {
    const { sessions, total } = await statsService.getHistory(50, 1);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4">Session History</h1>
                <p className="text-slate-400 mt-2">Log of your {total} most recent AI coding agent invocations.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl hidden sm:block">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Agent</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Task Type</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Code Diff</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tests</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {new Date(session.startedAt).toLocaleString(undefined, {
                                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30 capitalize">
                                        {session.agentName.replace('-code', '')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 capitalize">
                                    {session.taskType || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400">
                                    {session.cost ? `$${session.cost.costUsd.toFixed(4)}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {session.gitSnapshot ? (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-emerald-500">+{session.gitSnapshot.linesAdded}</span>
                                            <span className="text-red-500">-{session.gitSnapshot.linesRemoved}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {session.quality ? (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                            <BugPlay className="h-3 w-3 text-slate-400" />
                                            {session.quality.testsPassed} / {session.quality.testsPassed + session.quality.testsFailed}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {sessions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                    No agent sessions have been tracked yet. Run an agent natively in your terminal!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
