import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { ShieldCheck, Zap, Target } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { MetricDisplay } from '@/components/ui/MetricDisplay';

export default async function PerformancePage() {
    const { sessions } = await statsService.getHistory(undefined, 100, 1);

    // Calculate deeper performance metrics based on the last 100 runs
    const agentPerformance: Record<string, { 
        passed: number; 
        failed: number; 
        zeroShotCount: number; 
        totalSessionsWithZeroShot: number;
        totalTokenYield: number;
        sessionsWithYield: number;
    }> = {};

    sessions.forEach((s: any) => {
        if (!s.quality) return;

        if (!agentPerformance[s.agentName]) {
            agentPerformance[s.agentName] = { 
                passed: 0, failed: 0, 
                zeroShotCount: 0, totalSessionsWithZeroShot: 0,
                totalTokenYield: 0, sessionsWithYield: 0 
            };
        }

        agentPerformance[s.agentName].passed += s.quality.testsPassed;
        agentPerformance[s.agentName].failed += s.quality.testsFailed;

        if (s.quality.isZeroShot !== null && s.quality.isZeroShot !== undefined) {
            agentPerformance[s.agentName].totalSessionsWithZeroShot++;
            if (s.quality.isZeroShot) {
                agentPerformance[s.agentName].zeroShotCount++;
            }
        }

        if (s.quality.tokenYield !== null && s.quality.tokenYield !== undefined) {
            agentPerformance[s.agentName].sessionsWithYield++;
            agentPerformance[s.agentName].totalTokenYield += s.quality.tokenYield;
        }
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mt-4 flex items-center gap-3">
                    <Target className="w-8 h-8 text-accent" />
                    Agent Performance
                </h1>
                <p className="text-muted-foreground font-mono text-sm">TELEMETRY: QUALITY_GATES_AND_EFFICIENCY</p>
            </div>

            <BentoGrid className="md:auto-rows-[minmax(20rem,auto)] md:grid-cols-3">
                {Object.entries(agentPerformance).length === 0 ? (
                    <BentoCard className="md:col-span-3 items-center justify-center border-dashed border-slate-700 bg-transparent">
                        <div className="text-center flex flex-col items-center p-10">
                            <ShieldCheck className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-foreground font-medium text-lg">No Telemetry Available</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-md">Run an agent with a configured test suite to begin capturing zero-shot and yield metrics.</p>
                        </div>
                    </BentoCard>
                ) : (
                    Object.entries(agentPerformance).map(([agent, stats]) => {
                        const totalTests = stats.passed + stats.failed;
                        const passRate = totalTests > 0 ? (stats.passed / totalTests) * 100 : 0;
                        const zeroShotRate = stats.totalSessionsWithZeroShot > 0 ? (stats.zeroShotCount / stats.totalSessionsWithZeroShot) * 100 : 0;
                        const avgYield = stats.sessionsWithYield > 0 ? (stats.totalTokenYield / stats.sessionsWithYield) : 0;
                        
                        // Lower yield is better. Under 1.5 is excellent.
                        const yieldStatus = avgYield === 0 ? 'neutral' : (avgYield < 1.5 ? 'success' : 'error');

                        return (
                            <BentoCard 
                                key={agent} 
                                className="md:col-span-1 relative overflow-hidden group/agentcard"
                            >
                                {/* Top colored bar replacing shadow */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent to-accent/20"></div>

                                <div className="flex justify-between items-start mb-6 pt-2">
                                    <h3 className="text-xl font-bold text-foreground capitalize tracking-tight flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                        {agent.replace('-code', '')}
                                    </h3>
                                    <span className="font-mono text-xs text-muted-foreground border border-border bg-secondary/30 px-2 py-1 rounded">
                                        MODEL_DATA
                                    </span>
                                </div>

                                <div className="space-y-6 flex-1 flex flex-col justify-center">
                                    <MetricDisplay 
                                        label="Test Pass Rate" 
                                        value={`${passRate.toFixed(1)}%`}
                                        status={passRate > 80 ? 'success' : 'error'}
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                                                <Target className="w-3 h-3 text-purple-400" />
                                                Zero-Shot
                                            </div>
                                            <div className="font-mono text-lg font-bold text-foreground">
                                                {zeroShotRate.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                                                <Zap className="w-3 h-3 text-amber-400" />
                                                Yield
                                            </div>
                                            <div className="font-mono text-lg font-bold text-foreground flex items-center gap-2">
                                                {avgYield > 0 ? avgYield.toFixed(2) : '-'}
                                                {avgYield > 0 && <span className={`w-1.5 h-1.5 rounded-full ${yieldStatus === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 mt-auto border-t border-border/50">
                                        <div className="flex justify-between items-center font-mono text-[10px] mb-2 text-muted-foreground uppercase tracking-wider">
                                            <span>Suite Result</span>
                                            <span><span className="text-emerald-500/80">{stats.passed} PASS</span> / <span className="text-rose-500/80">{stats.failed} FAIL</span></span>
                                        </div>
                                        {/* Precision Progress Bar */}
                                        <div className="w-full bg-secondary border border-border rounded-none h-1.5 flex overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-1.5"
                                                style={{ width: `${passRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </BentoCard>
                        )
                    })
                )}
            </BentoGrid>
        </div>
    );
}
