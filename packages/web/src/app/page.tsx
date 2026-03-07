import { statsService } from '@/lib/services/stats.service';
import { Bot, Coins, Activity, CheckCircle2 } from 'lucide-react';

export default async function Home() {
  const stats = await statsService.getOverview('all');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-4">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Welcome to your AgentFoundry V2 Tracker.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-sm font-medium">Total Sessions</span>
            <Bot className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalSessions}</div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-sm font-medium">Total API Spend</span>
            <Coins className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">${stats.totalCostUsd.toFixed(4)}</div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-sm font-medium">Test Pass Rate</span>
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.passRate.toFixed(1)}%</div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-sm font-medium">Active Agents</span>
            <Activity className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{Object.keys(stats.agentBreakdown).length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Agent Allocation</h2>
          <div className="space-y-4">
            {Object.entries(stats.agentBreakdown).length === 0 ? (
              <p className="text-slate-500 text-sm">No agent sessions tracked yet.</p>
            ) : (
              Object.entries(stats.agentBreakdown).map(([agent, count]) => (
                <div key={agent} className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium capitalize">{agent}</span>
                  <span className="text-slate-400 text-sm">{count} sessions</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tasks by Type</h2>
          <div className="space-y-4">
            {Object.entries(stats.taskTypeBreakdown).length === 0 ? (
              <p className="text-slate-500 text-sm">No classified tasks tracked yet.</p>
            ) : (
              Object.entries(stats.taskTypeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium capitalize">{type}</span>
                  <span className="text-slate-400 text-sm">{count} tasks</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
