/**
 * Predict engagement metrics from virality score
 */

export interface PredictedMetrics {
  impressions: number;
  likes: number;
  shares: number;
  comments: number;
}

export class EngagementPredictor {
  /**
   * Predict engagement based on score and baseline
   */
  predict(
    viralityScore: number,
    platform: string,
    baseline?: PredictedMetrics
  ): PredictedMetrics {
    // Use baseline if provided, otherwise use platform defaults
    const baseMetrics = baseline || this.getDefaultBaseline(platform);

    // Score multiplier (logarithmic, not linear)
    // Score 50 = 1x baseline
    // Score 70 = 3.5x baseline
    // Score 90 = 10x baseline
    const multiplier = Math.pow(1.08, viralityScore - 50);

    // Platform-specific engagement rates
    const platformRates = this.getPlatformRates(platform);

    return {
      impressions: Math.round(baseMetrics.impressions * multiplier * platformRates.reach),
      likes: Math.round(baseMetrics.likes * multiplier * platformRates.likes),
      shares: Math.round(baseMetrics.shares * multiplier * platformRates.shares),
      comments: Math.round(baseMetrics.comments * multiplier * platformRates.comments),
    };
  }

  /**
   * Get default baseline metrics for platform
   */
  private getDefaultBaseline(platform: string): PredictedMetrics {
    const baselines = {
      twitter: {
        impressions: 500,
        likes: 15,
        shares: 3,
        comments: 2,
      },
      linkedin: {
        impressions: 1000,
        likes: 30,
        shares: 5,
        comments: 4,
      },
      youtube: {
        impressions: 2000,
        likes: 50,
        shares: 10,
        comments: 8,
      },
      tiktok: {
        impressions: 5000,
        likes: 150,
        shares: 20,
        comments: 15,
      },
      instagram: {
        impressions: 1500,
        likes: 80,
        shares: 5,
        comments: 10,
      },
    };

    return baselines[platform as keyof typeof baselines] || baselines.twitter;
  }

  /**
   * Platform-specific engagement rate modifiers
   */
  private getPlatformRates(platform: string): {
    reach: number;
    likes: number;
    shares: number;
    comments: number;
  } {
    const rates = {
      twitter: {
        reach: 1.0,
        likes: 1.0,
        shares: 1.0,
        comments: 1.0,
      },
      linkedin: {
        reach: 1.2,
        likes: 1.5,
        shares: 1.3,
        comments: 1.4,
      },
      youtube: {
        reach: 0.8,
        likes: 0.9,
        shares: 1.2,
        comments: 1.1,
      },
      tiktok: {
        reach: 2.0,
        likes: 2.5,
        shares: 1.8,
        comments: 1.5,
      },
      instagram: {
        reach: 1.1,
        likes: 1.8,
        shares: 0.8,
        comments: 1.2,
      },
    };

    return rates[platform as keyof typeof rates] || rates.twitter;
  }
}
