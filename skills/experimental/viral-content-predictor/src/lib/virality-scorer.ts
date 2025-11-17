/**
 * Virality scoring engine
 */

export interface ViralityScore {
  overall: number;
  breakdown: {
    hook_strength: number;
    structure: number;
    emotional_resonance: number;
    trend_alignment: number;
    visual_appeal: number;
    call_to_action: number;
  };
}

export class ViralityScorer {
  /**
   * Calculate overall virality score
   */
  calculateScore(
    content: string,
    platform: string,
    media?: string[]
  ): ViralityScore {
    const breakdown = {
      hook_strength: this.analyzeHook(content, platform),
      structure: this.analyzeStructure(content, platform),
      emotional_resonance: this.analyzeEmotion(content),
      trend_alignment: this.analyzeTrends(content),
      visual_appeal: this.analyzeVisuals(media || []),
      call_to_action: this.analyzeCTA(content),
    };

    // Platform-specific weights
    const weights = this.getPlatformWeights(platform);

    const overall = Math.round(
      breakdown.hook_strength * weights.hook +
      breakdown.structure * weights.structure +
      breakdown.emotional_resonance * weights.emotional +
      breakdown.trend_alignment * weights.trend +
      breakdown.visual_appeal * weights.visual +
      breakdown.call_to_action * weights.cta
    );

    return {
      overall: Math.min(100, Math.max(0, overall)),
      breakdown,
    };
  }

  /**
   * Analyze hook/opening strength
   */
  private analyzeHook(content: string, platform: string): number {
    const firstLine = content.split('\n')[0] || content.substring(0, 100);

    let score = 50; // Base score

    // Curiosity triggers
    const curiosityWords = ['secret', 'nobody tells you', 'hidden', 'revealed', 'shocking'];
    if (curiosityWords.some(w => firstLine.toLowerCase().includes(w))) {
      score += 15;
    }

    // Numbers (specificity)
    if (/\d+/.test(firstLine)) {
      score += 10;
    }

    // Question
    if (firstLine.includes('?')) {
      score += 10;
    }

    // Platform-specific optimal length
    const length = firstLine.length;
    if (platform === 'twitter' && length < 50) score += 10;
    if (platform === 'linkedin' && length > 30 && length < 80) score += 10;

    return Math.min(100, score);
  }

  /**
   * Analyze structure/formatting
   */
  private analyzeStructure(content: string, platform: string): number {
    let score = 50;

    const lines = content.split('\n');
    const words = content.split(/\s+/).length;

    // Twitter thread structure
    if (platform === 'twitter') {
      if (lines.length > 3 && lines.length < 15) score += 20;
      if (lines.length > 15) score -= 10; // Too long
    }

    // LinkedIn structure
    if (platform === 'linkedin') {
      if (words > 100 && words < 300) score += 20;
      if (lines.length > 5) score += 10; // Paragraphs/spacing
    }

    // Emojis (moderate use)
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    if (emojiCount > 0 && emojiCount < 5) score += 10;
    if (emojiCount > 10) score -= 10; // Too many

    return Math.min(100, score);
  }

  /**
   * Analyze emotional resonance
   */
  private analyzeEmotion(content: string): number {
    let score = 50;

    // Emotional trigger words
    const emotions = {
      positive: ['amazing', 'incredible', 'love', 'excited', 'awesome'],
      negative: ['horrible', 'terrible', 'hate', 'angry', 'frustrated'],
      surprise: ['shocked', 'unbelievable', 'wow', 'mind-blowing'],
    };

    const lowerContent = content.toLowerCase();

    for (const category of Object.values(emotions)) {
      if (category.some(w => lowerContent.includes(w))) {
        score += 10;
      }
    }

    // Personal stories
    if (lowerContent.includes('i ') || lowerContent.includes('my ')) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Analyze trend alignment
   */
  private analyzeTrends(content: string): number {
    // Simplified - in production would check Google Trends API
    const trendingTopics = ['ai', 'gpt', 'chatgpt', 'automation', 'productivity'];
    const lowerContent = content.toLowerCase();

    let score = 40;

    for (const topic of trendingTopics) {
      if (lowerContent.includes(topic)) {
        score += 15;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Analyze visual appeal
   */
  private analyzeVisuals(media: string[]): number {
    if (media.length === 0) return 30; // No media is suboptimal

    let score = 60;

    if (media.length === 1) score += 30;
    if (media.length > 1 && media.length <= 4) score += 20;
    if (media.length > 4) score -= 10; // Too many

    return Math.min(100, score);
  }

  /**
   * Analyze call-to-action
   */
  private analyzeCTA(content: string): number {
    const ctaWords = ['reply', 'comment', 'share', 'tag', 'click', 'link in bio'];
    const lowerContent = content.toLowerCase();

    let score = 40;

    for (const cta of ctaWords) {
      if (lowerContent.includes(cta)) {
        score += 15;
        break;
      }
    }

    // Questions engage
    if (content.includes('?')) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Get platform-specific weights
   */
  private getPlatformWeights(platform: string): {
    hook: number;
    structure: number;
    emotional: number;
    trend: number;
    visual: number;
    cta: number;
  } {
    const weights = {
      twitter: {
        hook: 0.30,
        structure: 0.15,
        emotional: 0.25,
        trend: 0.15,
        visual: 0.10,
        cta: 0.05,
      },
      linkedin: {
        hook: 0.25,
        structure: 0.20,
        emotional: 0.20,
        trend: 0.15,
        visual: 0.10,
        cta: 0.10,
      },
      youtube: {
        hook: 0.30,
        structure: 0.15,
        emotional: 0.20,
        trend: 0.10,
        visual: 0.20,
        cta: 0.05,
      },
      tiktok: {
        hook: 0.35,
        structure: 0.10,
        emotional: 0.25,
        trend: 0.15,
        visual: 0.10,
        cta: 0.05,
      },
      instagram: {
        hook: 0.25,
        structure: 0.15,
        emotional: 0.20,
        trend: 0.10,
        visual: 0.25,
        cta: 0.05,
      },
    };

    return weights[platform as keyof typeof weights] || weights.twitter;
  }

  /**
   * Get rating from score
   */
  getRating(score: number): 'poor' | 'fair' | 'good' | 'excellent' | 'viral' {
    if (score >= 90) return 'viral';
    if (score >= 75) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }
}
