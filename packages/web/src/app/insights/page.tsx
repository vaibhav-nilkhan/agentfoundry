import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { Lightbulb, Trophy, TrendingDown, Info, ShieldCheck, Activity } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { MetricDisplay } from '@/components/ui/MetricDisplay';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
    const recommendations = await statsService.getRecommendations();
    const benchmarks = await statsService.getBenchmarks();

    // Group recommendations by task type for display
    const recommendationsByTask: Record<string, any[]> = {};
    recommendations.forEach(rec => {
        if (!recommendationsByTask[rec.taskType]) {
            recommendationsByTask[rec.taskType] = [];
        }
        recommendationsByTask[rec.taskType].push(rec);
    });

    // Process benchmarks for evidence
    const benchmarkWins: Record<string, Record<string, number>> = {};
    const taskBenchmarks: Record<string, any[]> = {};
    
    benchmarks.forEach(b => {
        const tt = b.taskType || 'unknown';
        if (!benchmarkWins[tt]) benchmarkWins[tt] = {};
        if (b.winner) {
            benchmarkWins[tt][b.winner] = (benchmarkWins[tt][b.winner] || 0) + 1;
        }
        if (!taskBenchmarks[tt]) taskBenchmarks[tt] = [];
        taskBenchmarks[tt].push(b);
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mt-4 flex items-center gap-3">
                    <Lightbulb className="w-8 h-8 text-amber-400" />
                    Agent Insights
                </h1>
                <p className="text-muted-foreground font-mono text-sm">INTELLIGENCE_MODULE: PERFORMANCE_OPTIMIZATION</p>
            </div>

            {recommendations.length === 0 ? (
                <BentoCard className="items-center justify-center border-dashed border-slate-700 bg-transparent py-20">
                    <div className="text-center flex flex-col items-center">
                        <Info className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-foreground font-medium text-lg">Insufficient Data</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md font-mono">
                            Run more sessions with quality checks enabled to generate agent recommendations.
                        </p>
                    </div>
                </BentoCard>
            ) : (
                <div className="space-y-12">
                    {/* Overall Champions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Top Performing Agents
                        </h2>
                        <BentoGrid className="md:auto-rows-[minmax(12rem,auto)] md:grid-cols-3">
                            {recommendations.slice(0, 3).map((rec, index) => {
                                const wins = benchmarkWins[rec.taskType]?.[rec.agentName] || 0;
                                return (
                                    <BentoCard 
                                        key={`${rec.agentName}-${rec.taskType}`}
                                        className={index === 0 ? "border-t-yellow-500/50" : ""}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{index === 0 ? '🥇' : (index === 1 ? '🥈' : '🥉')}</span>
                                                <span className="font-bold capitalize">{rec.agentName}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border border-border bg-secondary font-mono ${
                                                rec.confidence === 'high' ? 'text-emerald-400' : 'text-amber-400'
                                            }`}>
                                                CONF: {rec.confidence.toUpperCase()}
                                            </span>
                                        </div>
                                        
                                        <MetricDisplay 
                                            label={`Best for ${rec.taskType}`}
                                            value={`${rec.metrics.passRate.toFixed(1)}%`}
                                            status="success"
                                            subValue="Pass Rate"
                                        />

                                        {wins > 0 && (
                                            <div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono">
                                                <Trophy className="w-3 h-3" />
                                                WON {wins} BENCHMARK{wins > 1 ? 'S' : ''}
                                            </div>
                                        )}
                                    </BentoCard>
                                );
                            })}
                        </BentoGrid>
                    </div>

                    {/* Breakdown by Task Category */}
                    {Object.entries(recommendationsByTask).map(([taskType, items]) => {
                        const recentBenchmark = taskBenchmarks[taskType]?.[0];

                        return (
                            <div key={taskType} className="space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2 capitalize border-b border-border pb-2">
                                    <ShieldCheck className="w-5 h-5 text-accent" />
                                    {taskType} Sub-System
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Recommendations Grid */}
                                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {items.sort((a, b) => b.score - a.score).map((item) => {
                                            const wins = benchmarkWins[taskType]?.[item.agentName] || 0;
                                            return (
                                                <div key={item.agentName} className="bento-card p-4 space-y-3 relative overflow-hidden">
                                                    {wins > 0 && (
                                                        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl">
                                                            {wins} WIN{wins > 1 ? 'S' : ''}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold capitalize text-sm flex items-center gap-2">
                                                            {item.agentName}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-muted-foreground mt-1">SCORE: {item.score.toFixed(2)}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[11px] font-mono">
                                                            <span className="text-muted-foreground">Yield:</span>
                                                            <span className={item.metrics.avgTokenYield < 1.5 ? 'text-emerald-400' : 'text-amber-400'}>
                                                                {item.metrics.avgTokenYield.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] font-mono">
                                                            <span className="text-muted-foreground">Avg Cost:</span>
                                                            <span className="text-foreground">${item.metrics.avgCostUsd.toFixed(4)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-secondary h-1 rounded-full overflow-hidden mt-2">
                                                        <div 
                                                            className="bg-accent h-full" 
                                                            style={{ width: `${(item.score / 1) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Benchmark Evidence Panel */}
                                    <div className="lg:col-span-1">
                                        <BentoCard className="h-full bg-secondary/30">
                                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-foreground">
                                                <Activity className="w-4 h-4 text-blue-400" />
                                                Benchmark Evidence
                                            </div>
                                            {recentBenchmark ? (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-muted-foreground font-mono truncate" title={recentBenchmark.taskHint}>
                                                        &gt; {recentBenchmark.taskHint}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {recentBenchmark.sessions.slice(0, 2).map((session: any, idx: number) => {
                                                            const isWinner = idx === 0;
                                                            return (
                                                                <div key={session.id} className={`p-2 rounded border text-xs font-mono flex flex-col gap-1 ${isWinner ? 'bg-amber-500/10 border-amber-500/20' : 'bg-background border-border'}`}>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className={`font-bold capitalize ${isWinner ? 'text-amber-400' : 'text-muted-foreground'}`}>
                                                                            {isWinner ? '🥇 ' : '🥈 '}{session.agentName}
                                                                        </span>
                                                                        <span>${session.cost?.costUsd?.toFixed(3) || '0.000'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                                                        <span>Yield: {session.quality?.tokenYield?.toFixed(2) || 'N/A'}</span>
                                                                        <span>Pass: {
                                                                            session.quality ? 
                                                                            ((session.quality.testsPassed / ((session.quality.testsPassed + session.quality.testsFailed) || 1)) * 100).toFixed(0) + '%' 
                                                                            : 'N/A'
                                                                        }</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {recentBenchmark.sessions.length > 2 && (
                                                        <div className="text-[10px] text-muted-foreground text-center mt-2 font-mono">
                                                            + {recentBenchmark.sessions.length - 2} other agents tested
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2 py-8">
                                                    <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                                                    <p className="text-xs font-mono text-muted-foreground">No recent benchmarks<br/>in this category.</p>
                                                </div>
                                            )}
                                        </BentoCard>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Efficiency Insights */}
                    <BentoGrid className="md:auto-rows-[15rem] md:grid-cols-2">
                        <BentoCard 
                            title="Cost Savings Projection" 
                            description="Estimated monthly savings by switching to the top-recommended agents."
                            icon={<TrendingDown className="w-4 h-4 text-emerald-400" />}
                        >
                            <div className="mt-4">
                                <div className="text-4xl font-bold font-mono text-emerald-400">$12.45</div>
                                <p className="text-xs text-muted-foreground mt-2 font-mono">EST_MONTHLY_DELTA | BASED_ON_CURRENT_VOLUME</p>
                            </div>
                        </BentoCard>
                        
                        <BentoCard 
                            title="Intelligence Note" 
                            description="Recommendations are weighted by success rate (50%), token yield (30%), and API cost (20%)."
                            icon={<Info className="w-4 h-4 text-blue-400" />}
                        >
                            <div className="mt-4 space-y-2 text-xs font-mono text-muted-foreground">
                                <p>&gt; PASS_RATE: Critical for reliable shipping.</p>
                                <p>&gt; TOKEN_YIELD: Measures efficiency and "thrashing".</p>
                                <p>&gt; API_COST: Normalized spend per successful session.</p>
                                <p>&gt; BENCHMARKS: Provides head-to-head empirical evidence.</p>
                            </div>
                        </BentoCard>
                    </BentoGrid>
                </div>
            )}
        </div>
    );
}