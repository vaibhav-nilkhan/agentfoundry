import { z } from 'zod';

/**
 * Track Costs - Real-time cost monitoring and analytics
 *
 * Provides detailed cost tracking, breakdowns, trend analysis, and alerts
 * for AI agent operations. Supports grouping by model, tool, user, or task type.
 */

export const TrackCostsInputSchema = z.object({
  session_id: z.string().optional(),
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  group_by: z.enum(['model', 'tool', 'user', 'task_type']).default('model'),
});

export const TrackCostsOutputSchema = z.object({
  total_cost: z.number(),
  cost_breakdown: z.record(z.number()),
  trends: z.object({
    daily_average: z.number(),
    peak_cost: z.number(),
    peak_timestamp: z.string().datetime().optional(),
    cost_trend: z.enum(['increasing', 'stable', 'decreasing']),
    trend_percentage: z.number(),
  }),
  alerts: z.array(z.object({
    type: z.string(),
    message: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    timestamp: z.string().datetime(),
  })),
  execution_count: z.number(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
});

export type TrackCostsInput = z.infer<typeof TrackCostsInputSchema>;
export type TrackCostsOutput = z.infer<typeof TrackCostsOutputSchema>;

/**
 * Cost entry for tracking
 */
interface CostEntry {
  timestamp: Date;
  sessionId?: string;
  model: string;
  tool?: string;
  user?: string;
  taskType?: string;
  cost: number;
  tokens: number;
}

/**
 * In-memory cost tracking store
 * In production, this would be persisted to database/time-series DB
 */
const costHistory: CostEntry[] = [];

/**
 * Calculate period boundaries
 */
function getPeriodBoundaries(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'hour':
      start.setHours(start.getHours() - 1);
      break;
    case 'day':
      start.setHours(start.getHours() - 24);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
  }

  return { start, end };
}

/**
 * Filter cost entries by period and session
 */
function filterEntries(
  entries: CostEntry[],
  periodStart: Date,
  periodEnd: Date,
  sessionId?: string
): CostEntry[] {
  return entries.filter(entry => {
    const inPeriod = entry.timestamp >= periodStart && entry.timestamp <= periodEnd;
    const matchesSession = !sessionId || entry.sessionId === sessionId;
    return inPeriod && matchesSession;
  });
}

/**
 * Group and sum costs by specified dimension
 */
function groupCosts(entries: CostEntry[], groupBy: string): Record<string, number> {
  const grouped: Record<string, number> = {};

  for (const entry of entries) {
    let key: string;

    switch (groupBy) {
      case 'model':
        key = entry.model;
        break;
      case 'tool':
        key = entry.tool || 'unknown';
        break;
      case 'user':
        key = entry.user || 'unknown';
        break;
      case 'task_type':
        key = entry.taskType || 'unknown';
        break;
      default:
        key = 'other';
    }

    grouped[key] = (grouped[key] || 0) + entry.cost;
  }

  // Round to 5 decimal places
  for (const key in grouped) {
    grouped[key] = Math.round(grouped[key] * 100000) / 100000;
  }

  return grouped;
}

/**
 * Calculate daily average cost
 */
function calculateDailyAverage(
  entries: CostEntry[],
  periodStart: Date,
  periodEnd: Date
): number {
  if (entries.length === 0) return 0;

  const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
  const daysInPeriod = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);

  return totalCost / Math.max(1, daysInPeriod);
}

/**
 * Find peak cost and timestamp
 */
function findPeakCost(entries: CostEntry[]): { cost: number; timestamp?: Date } {
  if (entries.length === 0) return { cost: 0 };

  // Group by hour and find peak hourly cost
  const hourlyCosts: Record<string, number> = {};

  for (const entry of entries) {
    const hourKey = new Date(entry.timestamp).setMinutes(0, 0, 0).toString();
    hourlyCosts[hourKey] = (hourlyCosts[hourKey] || 0) + entry.cost;
  }

  let peakCost = 0;
  let peakTimestamp: Date | undefined;

  for (const [hourKey, cost] of Object.entries(hourlyCosts)) {
    if (cost > peakCost) {
      peakCost = cost;
      peakTimestamp = new Date(parseInt(hourKey));
    }
  }

  return { cost: peakCost, timestamp: peakTimestamp };
}

/**
 * Analyze cost trend
 */
function analyzeTrend(
  entries: CostEntry[],
  periodStart: Date,
  periodEnd: Date
): { trend: 'increasing' | 'stable' | 'decreasing'; percentage: number } {
  if (entries.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }

  // Split period into two halves
  const midpoint = new Date((periodStart.getTime() + periodEnd.getTime()) / 2);

  const firstHalf = entries.filter(e => e.timestamp < midpoint);
  const secondHalf = entries.filter(e => e.timestamp >= midpoint);

  const firstHalfCost = firstHalf.reduce((sum, e) => sum + e.cost, 0);
  const secondHalfCost = secondHalf.reduce((sum, e) => sum + e.cost, 0);

  if (firstHalfCost === 0) {
    return { trend: 'increasing', percentage: 100 };
  }

  const changePercent = ((secondHalfCost - firstHalfCost) / firstHalfCost) * 100;

  let trend: 'increasing' | 'stable' | 'decreasing';
  if (changePercent > 10) {
    trend = 'increasing';
  } else if (changePercent < -10) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }

  return {
    trend,
    percentage: Math.round(Math.abs(changePercent) * 10) / 10,
  };
}

/**
 * Generate cost alerts based on patterns
 */
function generateAlerts(
  entries: CostEntry[],
  totalCost: number,
  trend: { trend: string; percentage: number },
  dailyAverage: number
): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high'; timestamp: string }> {
  const alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high'; timestamp: string }> = [];
  const now = new Date().toISOString();

  // Alert: High total cost
  if (totalCost > 100) {
    alerts.push({
      type: 'high_cost',
      message: `Total cost of $${totalCost.toFixed(2)} is significantly high`,
      severity: 'high',
      timestamp: now,
    });
  } else if (totalCost > 50) {
    alerts.push({
      type: 'elevated_cost',
      message: `Total cost of $${totalCost.toFixed(2)} is elevated`,
      severity: 'medium',
      timestamp: now,
    });
  }

  // Alert: Increasing trend
  if (trend.trend === 'increasing' && trend.percentage > 50) {
    alerts.push({
      type: 'cost_spike',
      message: `Costs increasing by ${trend.percentage}% - investigate potential issues`,
      severity: 'high',
      timestamp: now,
    });
  } else if (trend.trend === 'increasing' && trend.percentage > 20) {
    alerts.push({
      type: 'cost_increase',
      message: `Costs trending up by ${trend.percentage}%`,
      severity: 'medium',
      timestamp: now,
    });
  }

  // Alert: High daily average
  if (dailyAverage > 20) {
    alerts.push({
      type: 'high_daily_average',
      message: `Daily average of $${dailyAverage.toFixed(2)} may exceed monthly budget`,
      severity: 'medium',
      timestamp: now,
    });
  }

  // Alert: Decreasing trend (positive)
  if (trend.trend === 'decreasing' && trend.percentage > 20) {
    alerts.push({
      type: 'cost_optimization',
      message: `Great! Costs decreased by ${trend.percentage}%`,
      severity: 'low',
      timestamp: now,
    });
  }

  return alerts;
}

/**
 * Main tracking function
 */
export async function run(input: TrackCostsInput): Promise<TrackCostsOutput> {
  // Validate input
  const validated = TrackCostsInputSchema.parse(input);

  const { session_id, period, group_by } = validated;

  // Get period boundaries
  const { start: periodStart, end: periodEnd } = getPeriodBoundaries(period);

  // Filter entries
  const filteredEntries = filterEntries(costHistory, periodStart, periodEnd, session_id);

  // Calculate total cost
  const totalCost = filteredEntries.reduce((sum, e) => sum + e.cost, 0);

  // Group costs
  const costBreakdown = groupCosts(filteredEntries, group_by);

  // Calculate metrics
  const dailyAverage = calculateDailyAverage(filteredEntries, periodStart, periodEnd);
  const { cost: peakCost, timestamp: peakTimestamp } = findPeakCost(filteredEntries);
  const trendAnalysis = analyzeTrend(filteredEntries, periodStart, periodEnd);

  // Generate alerts
  const alerts = generateAlerts(filteredEntries, totalCost, trendAnalysis, dailyAverage);

  return {
    total_cost: Math.round(totalCost * 100000) / 100000,
    cost_breakdown: costBreakdown,
    trends: {
      daily_average: Math.round(dailyAverage * 100000) / 100000,
      peak_cost: Math.round(peakCost * 100000) / 100000,
      peak_timestamp: peakTimestamp?.toISOString(),
      cost_trend: trendAnalysis.trend,
      trend_percentage: trendAnalysis.percentage,
    },
    alerts,
    execution_count: filteredEntries.length,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
  };
}

/**
 * Add cost entry to tracking (helper function for other tools)
 */
export function addCostEntry(entry: Omit<CostEntry, 'timestamp'> & { timestamp?: Date }): void {
  costHistory.push({
    timestamp: entry.timestamp || new Date(),
    sessionId: entry.sessionId,
    model: entry.model,
    tool: entry.tool,
    user: entry.user,
    taskType: entry.taskType,
    cost: entry.cost,
    tokens: entry.tokens,
  });

  // Limit history size (keep last 10000 entries)
  if (costHistory.length > 10000) {
    costHistory.shift();
  }
}

/**
 * Get recent cost summary (helper function)
 */
export function getRecentCostSummary(minutes: number = 60): {
  totalCost: number;
  entryCount: number;
  averageCost: number;
} {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const recentEntries = costHistory.filter(e => e.timestamp >= cutoff);

  const totalCost = recentEntries.reduce((sum, e) => sum + e.cost, 0);
  const averageCost = recentEntries.length > 0 ? totalCost / recentEntries.length : 0;

  return {
    totalCost: Math.round(totalCost * 100000) / 100000,
    entryCount: recentEntries.length,
    averageCost: Math.round(averageCost * 100000) / 100000,
  };
}
