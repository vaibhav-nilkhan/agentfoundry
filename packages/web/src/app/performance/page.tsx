import { statsService } from '@/lib/services/stats.service';
import { ShieldCheck, BugPlay, AlertCircle } from 'lucide-react';

export default async function PerformancePage() {
    const { sessions, total } = await statsService.getHistory(100, 1);

    // Calculate deeper performance metrics based on the last 100 runs
    const agentPerformance: Record<string, { passed: number; failed: number }> = {};

    sessions.forEach(s => {
        if (!s.quality) return;

        if (!agentPerformance[s.agentName]) {
            agentPerformance[s.agentName] = { passed: 0, failed: 0 };
        }

        agentPerformance[s.agentName].passed += s.quality.testsPassed;
        agentPerformance[s.agentName].failed += s.quality.testsFailed;
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4">Code Quality & Performance</h1>
                <p className="text-slate-400 mt-2">Test passing rates and build success broken down by coding agent.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(agentPerformance).length === 0 ? (
                    <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center border-dashed">
                        <ShieldCheck className="mx-auto h-8 w-8 text-slate-500 mb-3" />
                        <h3 className="text-slate-300 font-medium text-lg">No Testing Data</h3>
                        <p className="text-sm text-slate-500 mt-1">Run an agent with a configured test suite to see quality metrics here.</p>
                    </div>
                ) : (
                    Object.entries(agentPerformance).map(([agent, stats]) => {
                        const totalTests = stats.passed + stats.failed;
                        const passRate = totalTests > 0 ? (stats.passed / totalTests) * 100 : 0;

                        return (
                            <div key={agent} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-lg font-bold text-white capitalize">{agent.replace('-code', '')}</h3>
                                    <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                                        {passRate.toFixed(1)}% Pass Rate
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Tests Passed</span>
                                        <span className="font-medium text-white">{stats.passed}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-400" /> Tests Failed</span>
                                        <span className="font-medium text-white">{stats.failed}</span>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-slate-800">
                                        <div className="w-full bg-rose-500/20 rounded-full h-1.5 flex overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-1.5 rounded-full"
                                                style={{ width: `${passRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}
