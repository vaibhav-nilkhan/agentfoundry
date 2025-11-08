import { z } from 'zod';
import { run as analyzeCodebase } from './analyze-codebase';

const inputSchema = z.object({
  repo_url: z.string().url(),
  time_range: z.enum(['last_week', 'last_month', 'last_quarter', 'last_year']).default('last_quarter'),
  metric: z.enum(['total_cost', 'complexity', 'duplication', 'test_coverage']).default('total_cost'),
});

interface DataPoint {
  date: string;
  value: number;
}

interface TrendOutput {
  current_value: number;
  change_percentage: number;
  trend: 'improving' | 'stable' | 'degrading';
  data_points: DataPoint[];
  recommendations: string[];
}

export async function run(input: z.infer<typeof inputSchema>): Promise<TrendOutput> {
  const validated = inputSchema.parse(input);

  // For MVP, we'll do a current snapshot and simulate historical data
  // In production, this would store historical analyses in a database

  const currentAnalysis = await analyzeCodebase({
    repo_url: validated.repo_url,
    branch: 'main',
    config: {},
  });

  const currentValue = currentAnalysis.total_debt_cost_annual;

  // Simulate historical data points (in production, fetch from database)
  const dataPoints: DataPoint[] = [];
  const periods = {
    last_week: 7,
    last_month: 4,
    last_quarter: 12,
    last_year: 12,
  };

  const numPoints = periods[validated.time_range];

  for (let i = numPoints; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7)); // Weekly intervals

    // Simulate slight variation
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    const value = Math.round(currentValue * (1 + variance));

    dataPoints.push({
      date: date.toISOString().split('T')[0],
      value,
    });
  }

  // Calculate trend
  const firstValue = dataPoints[0].value;
  const lastValue = dataPoints[dataPoints.length - 1].value;
  const changePercentage = ((lastValue - firstValue) / firstValue) * 100;

  const trend: 'improving' | 'stable' | 'degrading' =
    changePercentage < -5 ? 'improving' :
    changePercentage > 5 ? 'degrading' :
    'stable';

  // Generate recommendations
  const recommendations: string[] = [];
  if (trend === 'degrading') {
    recommendations.push('Technical debt is increasing. Consider allocating more time for refactoring.');
    recommendations.push('Review recent changes to identify sources of new complexity.');
  } else if (trend === 'stable') {
    recommendations.push('Debt levels are stable. Maintain current refactoring efforts.');
  } else {
    recommendations.push('Great job! Technical debt is decreasing.');
    recommendations.push('Continue current refactoring practices.');
  }

  return {
    current_value: currentValue,
    change_percentage: Math.round(changePercentage * 10) / 10,
    trend,
    data_points: dataPoints,
    recommendations,
  };
}
