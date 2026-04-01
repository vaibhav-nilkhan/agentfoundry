import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { cookies } from 'next/headers';
import { Trophy, Clock, Code2, CheckCircle2, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BenchmarkLeaderboardPage() {
  const cookieStore = await cookies();
  const teamId = cookieStore.get('af_team_id')?.value || undefined;

  const benchmarks = await statsService.getBenchmarks(teamId);

  if (benchmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
          <Trophy className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Benchmarks Found</h2>
        <p className="text-slate-400 max-w-md">
          Run a benchmark using <code className="bg-secondary px-1 py-0.5 rounded text-accent">agentfoundry benchmark</code> to see agent comparisons here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Benchmark Leaderboard</h1>
          <p className="text-slate-400">Compare agent performance on identical tasks.</p>
        </div>
      </div>

      <div className="space-y-8">
        {benchmarks.map((benchmark) => (
          <div key={benchmark.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-secondary/50 px-6 py-4 border-b border-border flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="h-4 w-4 text-accent" />
                  <h3 className="font-semibold text-lg">Task: {benchmark.taskHint}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="font-mono">{benchmark.id.substring(0, 8)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {benchmark.createdAt.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">Winner: {benchmark.winner}</span>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-card/50 border-b border-border">
                  <tr>
                    <th scope="col" className="px-6 py-3">Rank</th>
                    <th scope="col" className="px-6 py-3">Agent</th>
                    <th scope="col" className="px-6 py-3">Pass Rate</th>
                    <th scope="col" className="px-6 py-3">Token Yield</th>
                    <th scope="col" className="px-6 py-3">Duration</th>
                    <th scope="col" className="px-6 py-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmark.sessions.map((session: any, index: number) => {
                    const totalTests = (session.quality?.testsPassed || 0) + (session.quality?.testsFailed || 0);
                    const passRate = totalTests > 0 
                      ? ((session.quality?.testsPassed || 0) / totalTests) * 100 
                      : 0;
                    
                    const isWinner = index === 0;

                    return (
                      <tr 
                        key={session.id} 
                        className={`border-b border-border/50 last:border-0 transition-colors hover:bg-secondary/30 ${
                          isWinner ? 'bg-accent/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">
                          {isWinner ? (
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 font-bold">1</span>
                          ) : (
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-slate-400">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold flex items-center gap-2">
                          {session.agentName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {passRate === 100 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : passRate > 0 ? (
                              <CheckCircle2 className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{passRate.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {session.quality?.tokenYield ? session.quality.tokenYield.toFixed(2) : '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {session.durationSeconds ? `${session.durationSeconds}s` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-accent">
                          ${session.cost?.costUsd?.toFixed(4) || '0.0000'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
