import React from 'react';
import { statsService } from '@/lib/services/stats.service';
import { Bot, Coins, Activity, CheckCircle2, Terminal } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { MetricDisplay } from '@/components/ui/MetricDisplay';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stats = await statsService.getOverview(undefined, 'all');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-4 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-accent" />
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground font-mono text-sm">SYSTEM_STATUS: ONLINE | AGENT_FOUNDRY_V2</p>
      </div>

      {/* Top Level Metrics using Bento */}
      <BentoGrid className="md:auto-rows-[12rem] md:grid-cols-4">
        <BentoCard className="md:col-span-1 border-t-accent/50">
          <MetricDisplay 
            label="Total Sessions" 
            value={stats.totalSessions} 
            status="neutral"
          />
          <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm font-mono">
            <Bot className="h-4 w-4 text-indigo-400" />
            <span>Active swarm</span>
          </div>
        </BentoCard>

        <BentoCard className="md:col-span-1">
          <MetricDisplay 
            label="Total API Spend" 
            value={stats.totalCostUsd.toFixed(4)} 
            isCurrency={true}
            trend="up"
          />
          <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm font-mono">
            <Coins className="h-4 w-4 text-emerald-400" />
            <span>Across all agents</span>
          </div>
        </BentoCard>

        <BentoCard className="md:col-span-1">
          <MetricDisplay 
            label="Test Pass Rate" 
            value={`${stats.passRate.toFixed(1)}%`} 
            status={stats.passRate > 80 ? 'success' : 'error'}
          />
          <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm font-mono">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            <span>Quality Gate</span>
          </div>
        </BentoCard>

        <BentoCard className="md:col-span-1">
          <MetricDisplay 
            label="Active Agents" 
            value={Object.keys(stats.agentBreakdown).length} 
            status="neutral"
          />
          <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm font-mono">
            <Activity className="h-4 w-4 text-amber-400" />
            <span>Models deployed</span>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Secondary Metrics Grid */}
      <BentoGrid className="md:auto-rows-[18rem] md:grid-cols-2 mt-8">
        <BentoCard 
          title="Agent Allocation Breakdown" 
          description="Distribution of tasks across the active LLM swarm."
          className="md:col-span-1"
        >
          <div className="space-y-4 mt-4 font-mono text-sm">
            {Object.entries(stats.agentBreakdown).length === 0 ? (
              <p className="text-muted-foreground">No agent sessions tracked yet.</p>
            ) : (
              Object.entries(stats.agentBreakdown).map(([agent, count]) => (
                <div key={agent} className="flex items-center justify-between data-row-interactive p-2 rounded-md">
                  <span className="text-foreground capitalize flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    {agent}
                  </span>
                  <span className="text-muted-foreground">{count} sessions</span>
                </div>
              ))
            )}
          </div>
        </BentoCard>

        <BentoCard 
          title="Task Classification" 
          description="Auto-categorized based on AST and path analysis."
          className="md:col-span-1"
        >
          <div className="space-y-4 mt-4 font-mono text-sm">
            {Object.entries(stats.taskTypeBreakdown).length === 0 ? (
              <p className="text-muted-foreground">No classified tasks tracked yet.</p>
            ) : (
              Object.entries(stats.taskTypeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between data-row-interactive p-2 rounded-md">
                  <span className="text-foreground capitalize">{type}</span>
                  <span className="text-muted-foreground">{count} tasks</span>
                </div>
              ))
            )}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
