/**
 * Cost Predictor & Optimizer - Estimate costs, suggest cheaper alternatives, enforce budgets
 *
 * This skill helps prevent cost surprises in AI agent operations by providing:
 * - Pre-execution cost estimates with detailed breakdowns
 * - Cheaper model recommendations based on task requirements
 * - Budget enforcement with configurable limits and actions
 * - Real-time cost tracking and trend analysis
 *
 * @packageDocumentation
 */

export { run as estimateCost, EstimateCostInput, EstimateCostOutput } from './tools/estimate-cost';
export { run as suggestCheaper, SuggestCheaperInput, SuggestCheaperOutput } from './tools/suggest-cheaper';
export { run as setBudgetLimit, SetBudgetLimitInput, SetBudgetLimitOutput } from './tools/set-budget-limit';
export { run as trackCosts, TrackCostsInput, TrackCostsOutput } from './tools/track-costs';

// Re-export tool schemas for runtime validation
export { EstimateCostInputSchema, EstimateCostOutputSchema } from './tools/estimate-cost';
export { SuggestCheaperInputSchema, SuggestCheaperOutputSchema } from './tools/suggest-cheaper';
export { SetBudgetLimitInputSchema, SetBudgetLimitOutputSchema } from './tools/set-budget-limit';
export { TrackCostsInputSchema, TrackCostsOutputSchema } from './tools/track-costs';

// Re-export helper functions for integration
export { trackSpending, getBudgetInfo } from './tools/set-budget-limit';
export { addCostEntry, getRecentCostSummary } from './tools/track-costs';
