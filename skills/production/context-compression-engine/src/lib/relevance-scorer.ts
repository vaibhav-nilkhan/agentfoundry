export interface ScoringFactors {
  recency: number;
  semantic_similarity: number;
  user_importance: number;
  data_density: number;
}

export interface RankedItem {
  content: string;
  relevance_score: number;
  factors: {
    recency_score: number;
    similarity_score: number;
    importance_score: number;
    density_score: number;
  };
  rank: number;
  should_keep: boolean;
}

export class RelevanceScorer {
  /**
   * Score items by relevance to current task
   */
  score(items: any[], currentTask: string, factors: ScoringFactors): RankedItem[] {
    const ranked: RankedItem[] = items.map((item, index) => {
      const content = typeof item === 'string' ? item : item.content || '';

      // Calculate individual scores
      const recencyScore = this.scoreRecency(index, items.length);
      const similarityScore = this.scoreSimilarity(content, currentTask);
      const importanceScore = this.scoreImportance(content);
      const densityScore = this.scoreDataDensity(content);

      // Weighted total
      const relevanceScore =
        recencyScore * factors.recency +
        similarityScore * factors.semantic_similarity +
        importanceScore * factors.user_importance +
        densityScore * factors.data_density;

      return {
        content,
        relevance_score: Math.round(relevanceScore * 100),
        factors: {
          recency_score: Math.round(recencyScore * 100),
          similarity_score: Math.round(similarityScore * 100),
          importance_score: Math.round(importanceScore * 100),
          density_score: Math.round(densityScore * 100),
        },
        rank: 0, // Will be set after sorting
        should_keep: relevanceScore > 0.5,
      };
    });

    // Sort by relevance and assign ranks
    ranked.sort((a, b) => b.relevance_score - a.relevance_score);
    ranked.forEach((item, index) => {
      item.rank = index + 1;
    });

    return ranked;
  }

  /**
   * Score based on recency (recent = higher score)
   */
  private scoreRecency(index: number, total: number): number {
    return index / Math.max(total - 1, 1);
  }

  /**
   * Score based on semantic similarity (simple keyword matching)
   */
  private scoreSimilarity(content: string, task: string): number {
    const contentLower = content.toLowerCase();
    const taskWords = task.toLowerCase().split(/\s+/);

    let matches = 0;
    for (const word of taskWords) {
      if (word.length > 3 && contentLower.includes(word)) {
        matches++;
      }
    }

    return taskWords.length > 0 ? matches / taskWords.length : 0;
  }

  /**
   * Score based on importance markers
   */
  private scoreImportance(content: string): number {
    let score = 0.5; // Base score

    // Higher importance for questions, commands
    if (content.includes('?')) score += 0.2;
    if (content.match(/^(please|can you|could you|would you)/i)) score += 0.15;

    // Higher importance for structured data
    if (content.match(/:\s*[\d\[\{]/)) score += 0.15;

    return Math.min(score, 1);
  }

  /**
   * Score based on data density
   */
  private scoreDataDensity(content: string): number {
    // Count numbers, technical terms
    const numbers = (content.match(/\d+/g) || []).length;
    const technical = (content.match(/[A-Z]{2,}|\w+_\w+/g) || []).length;
    const words = content.split(/\s+/).length;

    const density = (numbers + technical) / Math.max(words, 1);
    return Math.min(density * 2, 1);
  }
}
