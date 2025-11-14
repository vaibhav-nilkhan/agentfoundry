export async function run(input: any): Promise<any> {
  const content = input.content;
  const threshold = input.similarity_threshold || 0.85;
  const strategy = input.preservation_strategy || 'keep_most_detailed';

  // Convert to array
  const items = Array.isArray(content) ? content : [content];

  // Find duplicates using simple similarity
  const duplicateGroups: any[] = [];
  const kept: any[] = [];
  const removed: Set<number> = new Set();

  for (let i = 0; i < items.length; i++) {
    if (removed.has(i)) continue;

    const currentItem = typeof items[i] === 'string' ? items[i] : items[i].content || '';
    const duplicates: number[] = [i];

    // Find similar items
    for (let j = i + 1; j < items.length; j++) {
      if (removed.has(j)) continue;

      const compareItem = typeof items[j] === 'string' ? items[j] : items[j].content || '';
      const similarity = calculateSimilarity(currentItem, compareItem);

      if (similarity >= threshold) {
        duplicates.push(j);
        removed.add(j);
      }
    }

    // Keep one representative from the group
    if (duplicates.length > 1) {
      let keepIndex = duplicates[0];

      if (strategy === 'keep_most_detailed') {
        // Keep the longest
        let maxLength = currentItem.length;
        for (const idx of duplicates) {
          const item = typeof items[idx] === 'string' ? items[idx] : items[idx].content || '';
          if (item.length > maxLength) {
            maxLength = item.length;
            keepIndex = idx;
          }
        }
      } else if (strategy === 'keep_first') {
        keepIndex = duplicates[0];
      }

      duplicateGroups.push({
        original_indices: duplicates,
        similarity_score: threshold,
        merged_content: null,
        action_taken: 'removed',
      });

      kept.push(items[keepIndex]);
    } else {
      kept.push(items[i]);
    }
  }

  return {
    deduplicated_content: kept,
    duplicates_found: duplicateGroups,
    statistics: {
      original_items: items.length,
      duplicate_groups: duplicateGroups.length,
      items_removed: items.length - kept.length,
      space_saved_tokens: Math.floor((items.length - kept.length) * 50), // Rough estimate
    },
  };
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple word-based similarity
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / Math.max(union.size, 1);
}
