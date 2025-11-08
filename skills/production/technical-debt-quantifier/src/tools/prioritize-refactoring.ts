import { z } from 'zod';
import { run as analyzeCodebase } from './analyze-codebase';
import { DebtCalculator } from '../lib/debt-calculator';

const inputSchema = z.object({
  repo_url: z.string().url(),
  refactoring_budget_hours: z.number().min(0),
  focus_area: z.enum(['all', 'security', 'performance', 'maintainability']).default('all'),
});

interface RefactoringTask {
  title: string;
  estimated_hours: number;
  annual_savings: number;
  roi: number;
  payback_period_months: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  files_affected: string[];
}

interface PrioritizationOutput {
  recommended_tasks: RefactoringTask[];
  total_potential_savings: number;
  budget_utilization: number;
}

export async function run(input: z.infer<typeof inputSchema>): Promise<PrioritizationOutput> {
  const validated = inputSchema.parse(input);
  const debtCalculator = new DebtCalculator();

  // First, analyze the codebase
  const analysis = await analyzeCodebase({
    repo_url: validated.repo_url,
    branch: 'main',
    config: {},
  });

  // Generate refactoring tasks from top problem files
  const tasks: RefactoringTask[] = [];

  for (const file of analysis.top_problem_files) {
    // Estimate refactoring effort based on complexity
    const estimatedHours = Math.ceil(file.complexity_score / 5);

    // Calculate ROI
    const roiCalc = debtCalculator.calculateROI(
      file.annual_cost,
      estimatedHours,
      analysis.metadata.config.avg_hourly_rate,
      0.7 // 70% improvement
    );

    tasks.push({
      title: `Refactor ${file.file_path}`,
      estimated_hours: estimatedHours,
      annual_savings: roiCalc.annualSavings,
      roi: roiCalc.roi,
      payback_period_months: roiCalc.paybackMonths,
      priority: roiCalc.roi > 3 ? 'critical' : roiCalc.roi > 2 ? 'high' : roiCalc.roi > 1 ? 'medium' : 'low',
      files_affected: [file.file_path],
    });
  }

  // Sort by ROI
  tasks.sort((a, b) => b.roi - a.roi);

  // Select tasks that fit within budget
  const selectedTasks: RefactoringTask[] = [];
  let hoursUsed = 0;

  for (const task of tasks) {
    if (hoursUsed + task.estimated_hours <= validated.refactoring_budget_hours) {
      selectedTasks.push(task);
      hoursUsed += task.estimated_hours;
    }
  }

  const totalSavings = selectedTasks.reduce((sum, t) => sum + t.annual_savings, 0);
  const budgetUtilization = (hoursUsed / validated.refactoring_budget_hours) * 100;

  return {
    recommended_tasks: selectedTasks,
    total_potential_savings: Math.round(totalSavings),
    budget_utilization: Math.round(budgetUtilization * 10) / 10,
  };
}
