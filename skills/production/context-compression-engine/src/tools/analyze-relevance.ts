import { RelevanceScorer, ScoringFactors } from '../lib/relevance-scorer';

export async function run(input: any): Promise<any> {
  const scorer = new RelevanceScorer();

  const factors: ScoringFactors = input.scoring_factors || {
    recency: 0.3,
    semantic_similarity: 0.4,
    user_importance: 0.2,
    data_density: 0.1,
  };

  // Convert context to array if needed
  const items = Array.isArray(input.context) ? input.context : [input.context];

  const rankedItems = scorer.score(items, input.current_task, factors);

  // Filter top N if requested
  const finalItems = input.return_top_n
    ? rankedItems.slice(0, input.return_top_n)
    : rankedItems;

  // Calculate summary stats
  const highCount = rankedItems.filter(item => item.relevance_score >= 70).length;
  const mediumCount = rankedItems.filter(
    item => item.relevance_score >= 40 && item.relevance_score < 70
  ).length;
  const lowCount = rankedItems.filter(item => item.relevance_score < 40).length;

  return {
    ranked_items: finalItems,
    summary: {
      total_items: rankedItems.length,
      high_relevance_count: highCount,
      medium_relevance_count: mediumCount,
      low_relevance_count: lowCount,
    },
    recommendations: {
      safe_to_remove: rankedItems
        .filter(item => item.relevance_score < 40)
        .map(item => item.content)
        .slice(0, 5),
      must_keep: rankedItems
        .filter(item => item.relevance_score >= 70)
        .map(item => item.content)
        .slice(0, 10),
    },
  };
}
