import { z } from 'zod';

/**
 * Set Budget Limit - Enforce spending caps and prevent cost overruns
 *
 * Creates budget controls with configurable limits, alert thresholds, and
 * enforcement actions. Supports per-execution, hourly, daily, and monthly budgets.
 */

export const SetBudgetLimitInputSchema = z.object({
  budget_limit: z.number().min(0),
  period: z.enum(['execution', 'hour', 'day', 'month']).default('execution'),
  action_on_exceed: z.enum(['block', 'warn', 'switch_cheaper']).default('warn'),
  alert_threshold: z.number().min(0).max(1).default(0.8),
});

export const SetBudgetLimitOutputSchema = z.object({
  budget_id: z.string(),
  status: z.string(),
  current_spending: z.number(),
  remaining_budget: z.number(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime().optional(),
  alert_settings: z.object({
    threshold_amount: z.number(),
    action: z.string(),
  }),
});

export type SetBudgetLimitInput = z.infer<typeof SetBudgetLimitInputSchema>;
export type SetBudgetLimitOutput = z.infer<typeof SetBudgetLimitOutputSchema>;

/**
 * Budget state storage (in-memory for this implementation)
 * In production, this would be persisted to database/Redis
 */
interface BudgetState {
  id: string;
  limit: number;
  period: string;
  action: string;
  alertThreshold: number;
  currentSpending: number;
  periodStart: Date;
  periodEnd?: Date;
  exceededAt?: Date;
}

const budgetStore = new Map<string, BudgetState>();

/**
 * Generate unique budget ID
 */
function generateBudgetId(): string {
  return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate period end time based on period type
 */
function calculatePeriodEnd(periodStart: Date, period: string): Date | undefined {
  switch (period) {
    case 'execution':
      return undefined; // No end time for single execution
    case 'hour':
      return new Date(periodStart.getTime() + 60 * 60 * 1000);
    case 'day':
      return new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
    case 'month':
      const nextMonth = new Date(periodStart);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return undefined;
  }
}

/**
 * Check if budget period has expired
 */
function isPeriodExpired(budget: BudgetState): boolean {
  if (!budget.periodEnd) return false; // Execution budgets don't expire
  return new Date() >= budget.periodEnd;
}

/**
 * Reset budget if period has expired
 */
function resetIfExpired(budget: BudgetState): BudgetState {
  if (isPeriodExpired(budget)) {
    const newPeriodStart = new Date();
    return {
      ...budget,
      currentSpending: 0,
      periodStart: newPeriodStart,
      periodEnd: calculatePeriodEnd(newPeriodStart, budget.period),
      exceededAt: undefined,
    };
  }
  return budget;
}

/**
 * Determine budget status
 */
function getBudgetStatus(currentSpending: number, limit: number, alertThreshold: number): string {
  const percentUsed = currentSpending / limit;

  if (currentSpending >= limit) {
    return 'exceeded';
  } else if (percentUsed >= alertThreshold) {
    return 'warning';
  } else if (percentUsed >= 0.5) {
    return 'active';
  } else {
    return 'healthy';
  }
}

/**
 * Main budget setting function
 */
export async function run(input: SetBudgetLimitInput): Promise<SetBudgetLimitOutput> {
  // Validate input
  const validated = SetBudgetLimitInputSchema.parse(input);

  const {
    budget_limit,
    period,
    action_on_exceed,
    alert_threshold,
  } = validated;

  // Create new budget
  const budgetId = generateBudgetId();
  const periodStart = new Date();
  const periodEnd = calculatePeriodEnd(periodStart, period);

  const budget: BudgetState = {
    id: budgetId,
    limit: budget_limit,
    period,
    action: action_on_exceed,
    alertThreshold: alert_threshold,
    currentSpending: 0,
    periodStart,
    periodEnd,
  };

  // Store budget
  budgetStore.set(budgetId, budget);

  // Calculate alert threshold amount
  const thresholdAmount = budget_limit * alert_threshold;

  // Determine status
  const status = getBudgetStatus(0, budget_limit, alert_threshold);

  return {
    budget_id: budgetId,
    status,
    current_spending: 0,
    remaining_budget: budget_limit,
    period_start: periodStart.toISOString(),
    period_end: periodEnd?.toISOString(),
    alert_settings: {
      threshold_amount: Math.round(thresholdAmount * 100000) / 100000,
      action: action_on_exceed,
    },
  };
}

/**
 * Track spending against budget (helper function for other tools to use)
 */
export function trackSpending(budgetId: string, cost: number): {
  allowed: boolean;
  action: string;
  message: string;
  currentSpending: number;
  remainingBudget: number;
} {
  let budget = budgetStore.get(budgetId);

  if (!budget) {
    return {
      allowed: true,
      action: 'none',
      message: `Budget ${budgetId} not found. Allowing operation.`,
      currentSpending: 0,
      remainingBudget: 0,
    };
  }

  // Reset if period expired
  budget = resetIfExpired(budget);
  budgetStore.set(budgetId, budget);

  // Calculate new spending
  const newSpending = budget.currentSpending + cost;
  const remainingBudget = budget.limit - newSpending;

  // Check if budget would be exceeded
  if (newSpending > budget.limit) {
    if (budget.action === 'block') {
      return {
        allowed: false,
        action: 'blocked',
        message: `Operation blocked: Would exceed budget limit of $${budget.limit}. Current: $${budget.currentSpending.toFixed(4)}, Requested: $${cost.toFixed(4)}`,
        currentSpending: budget.currentSpending,
        remainingBudget: Math.max(0, remainingBudget),
      };
    } else if (budget.action === 'switch_cheaper') {
      return {
        allowed: true,
        action: 'switch_model',
        message: `Budget limit reached. Switching to cheaper model automatically.`,
        currentSpending: newSpending,
        remainingBudget: Math.max(0, remainingBudget),
      };
    } else {
      // warn
      return {
        allowed: true,
        action: 'warn',
        message: `Warning: Budget limit of $${budget.limit} exceeded. Current: $${newSpending.toFixed(4)}`,
        currentSpending: newSpending,
        remainingBudget: Math.max(0, remainingBudget),
      };
    }
  }

  // Check if approaching alert threshold
  const percentUsed = newSpending / budget.limit;
  if (percentUsed >= budget.alertThreshold && budget.currentSpending / budget.limit < budget.alertThreshold) {
    // Just crossed threshold
    return {
      allowed: true,
      action: 'alert',
      message: `Alert: ${Math.round(percentUsed * 100)}% of budget used ($${newSpending.toFixed(4)} / $${budget.limit})`,
      currentSpending: newSpending,
      remainingBudget,
    };
  }

  // Update spending
  budget.currentSpending = newSpending;
  budgetStore.set(budgetId, budget);

  return {
    allowed: true,
    action: 'none',
    message: `Budget on track: $${newSpending.toFixed(4)} / $${budget.limit} (${Math.round(percentUsed * 100)}%)`,
    currentSpending: newSpending,
    remainingBudget,
  };
}

/**
 * Get current budget status (helper function)
 */
export function getBudgetInfo(budgetId: string): BudgetState | null {
  let budget = budgetStore.get(budgetId);
  if (!budget) return null;

  // Reset if expired
  budget = resetIfExpired(budget);
  budgetStore.set(budgetId, budget);

  return budget;
}
