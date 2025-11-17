/**
 * Technical debt cost calculation
 */

interface DebtMetrics {
  complexity: number;
  duplication: number;
  changeFrequency: number;
  linesOfCode: number;
}

interface CostConfig {
  avgHourlyRate: number;
  teamSize: number;
}

export class DebtCalculator {
  /**
   * Calculate annual cost of technical debt for a file
   */
  calculateAnnualCost(metrics: DebtMetrics, config: CostConfig): number {
    const {
      complexity,
      changeFrequency,
      linesOfCode,
      duplication,
    } = metrics;

    // 1. Maintenance cost (complexity × change frequency)
    const maintenanceCost = this.calculateMaintenanceCost(
      complexity,
      changeFrequency,
      config.avgHourlyRate
    );

    // 2. Onboarding cost (complex code takes longer to understand)
    const onboardingCost = this.calculateOnboardingCost(
      complexity,
      linesOfCode,
      config.avgHourlyRate,
      config.teamSize
    );

    // 3. Duplication cost
    const duplicationCost = this.calculateDuplicationCost(
      duplication,
      changeFrequency,
      config.avgHourlyRate
    );

    return Math.round(maintenanceCost + onboardingCost + duplicationCost);
  }

  /**
   * Calculate maintenance cost
   */
  private calculateMaintenanceCost(
    complexity: number,
    changeFrequency: number,
    hourlyRate: number
  ): number {
    // Normalized complexity factor (complexity / 20 as baseline)
    const complexityFactor = Math.max(1, complexity / 20);

    // Hours per change increases with complexity
    const hoursPerChange = 0.5 * complexityFactor;

    // Annual hours = changes per year × hours per change
    const annualHours = changeFrequency * hoursPerChange;

    return annualHours * hourlyRate;
  }

  /**
   * Calculate onboarding cost
   */
  private calculateOnboardingCost(
    complexity: number,
    linesOfCode: number,
    hourlyRate: number,
    teamSize: number
  ): number {
    // Assume 20% turnover per year
    const turnoverRate = 0.2;
    const newDevelopersPerYear = teamSize * turnoverRate;

    // Hours to understand complex code (increases logarithmically)
    const hoursToUnderstand = Math.log(complexity + 1) * (linesOfCode / 100) * 0.5;

    return newDevelopersPerYear * hoursToUnderstand * hourlyRate;
  }

  /**
   * Calculate duplication cost
   */
  private calculateDuplicationCost(
    duplicationPercentage: number,
    changeFrequency: number,
    hourlyRate: number
  ): number {
    // Duplication means changes need to be made in multiple places
    const duplicateFactor = duplicationPercentage / 100;

    // Extra hours per year due to duplication
    const extraHours = changeFrequency * 0.5 * duplicateFactor;

    return extraHours * hourlyRate;
  }

  /**
   * Calculate ROI for refactoring
   */
  calculateROI(
    currentAnnualCost: number,
    estimatedRefactoringHours: number,
    hourlyRate: number,
    improvementFactor: number = 0.7 // 70% improvement expected
  ): {
    roi: number;
    paybackMonths: number;
    annualSavings: number;
    refactoringCost: number;
  } {
    const refactoringCost = estimatedRefactoringHours * hourlyRate;
    const annualSavings = currentAnnualCost * improvementFactor;
    const roi = annualSavings / refactoringCost;
    const paybackMonths = refactoringCost / (annualSavings / 12);

    return {
      roi: Math.round(roi * 100) / 100,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      annualSavings: Math.round(annualSavings),
      refactoringCost: Math.round(refactoringCost),
    };
  }
}
