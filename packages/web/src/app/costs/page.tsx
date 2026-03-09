import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { DailyCostChart } from '@/components/DailyCostChart';
import { CircleDollarSign } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';

export default async function CostsPage() {
    const { agentTotals, dailyCosts } = await statsService.getCosts(undefined, 'all');

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mt-4 flex items-center gap-3">
                    <CircleDollarSign className="w-8 h-8 text-accent" />
                    API Cost Analysis
                </h1>
                <p className="text-muted-foreground font-mono text-sm">FINANCE_MODULE: TOKEN_EXPENDITURE_TRACKING</p>
            </div>

            <BentoGrid className="md:auto-rows-[minmax(25rem,auto)] md:grid-cols-2">
                
                {/* Left Card: Bar Chart of Totals */}
                <BentoCard 
                    title="Total Spend by Agent" 
                    description="Aggregate USD cost across all tracked CLI sessions."
                    className="md:col-span-1"
                >
                    <div className="space-y-6 mt-6">
                        {Object.entries(agentTotals).length === 0 ? (
                            <p className="text-muted-foreground font-mono text-sm">No cost data available.</p>
                        ) : (
                            Object.entries(agentTotals)
                                .sort((a, b) => b[1] - a[1]) // Sort highest cost first
                                .map(([agent, cost]) => (
                                    <div key={agent} className="group/cost-row">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-foreground font-medium capitalize flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                                {agent}
                                            </span>
                                            <span className="text-emerald-400 font-mono font-bold tracking-tight">${cost.toFixed(4)}</span>
                                        </div>
                                        {/* Premium Visual Bar representation */}
                                        <div className="w-full bg-secondary border border-border rounded-none h-2 overflow-hidden shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 transition-all duration-500 ease-out group-hover/cost-row:opacity-80"
                                                style={{
                                                    width: `${Math.max(2, (cost / Math.max(...Object.values(agentTotals))) * 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </BentoCard>

                {/* Right Card: Recharts Line Graph */}
                <BentoCard 
                    title="Daily Trend Chart" 
                    description="Rolling expenditure over the last 30 days."
                    className="md:col-span-1"
                >
                    <div className="mt-4 -ml-4 h-full min-h-[250px] w-[calc(100%+2rem)]">
                        <DailyCostChart data={dailyCosts} />
                    </div>
                </BentoCard>

            </BentoGrid>
        </div>
    );
}
