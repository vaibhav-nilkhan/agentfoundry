import { statsService } from '@/lib/services/stats.service';

export default async function CostsPage() {
    const { agentTotals, dailyCosts } = await statsService.getCosts('all');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4">API Costs Analysis</h1>
                <p className="text-slate-400 mt-2">Breakdown of USD spending by agent tooling.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Total Spend by Agent</h2>

                    <div className="space-y-6">
                        {Object.entries(agentTotals).length === 0 ? (
                            <p className="text-slate-500 text-sm">No cost data available.</p>
                        ) : (
                            Object.entries(agentTotals)
                                .sort((a, b) => b[1] - a[1]) // Sort highest cost first
                                .map(([agent, cost]) => (
                                    <div key={agent}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-300 font-medium capitalize">{agent}</span>
                                            <span className="text-emerald-400 font-semibold">${cost.toFixed(4)}</span>
                                        </div>
                                        {/* Visual Bar representation */}
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.max(2, (cost / Math.max(...Object.values(agentTotals))) * 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex flex-col h-full justify-center items-center text-center space-y-4 py-12 border-2 border-dashed border-slate-800 rounded-lg">
                        <span className="text-slate-500">Daily Trend Chart</span>
                        <span className="text-xs text-slate-600">Recharts mapping coming soon</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
