export async function run(input: any): Promise<any> {
  const content = input.content;
  const levels = input.levels || 2;
  const targetLengthPerLevel = input.target_length_per_level || [500, 200, 50];
  const preserveStructure = input.preserve_structure !== false;

  const summaries: any[] = [];

  // Level 1: Light summarization
  let currentSummary = content;

  for (let level = 1; level <= levels; level++) {
    const targetLength = targetLengthPerLevel[level - 1] || 100;
    const summary = summarize(currentSummary, targetLength, preserveStructure);

    summaries.push({
      level,
      content: summary,
      token_count: Math.ceil(summary.length / 4), // Rough token count
      compression_ratio: summary.length / content.length,
    });

    currentSummary = summary;
  }

  // Extract information hierarchy
  const sentences = content.split(/\. |\n/).filter((s: string) => s.trim());

  return {
    summaries,
    final_summary: summaries[summaries.length - 1]?.content || content,
    information_hierarchy: {
      critical: sentences.slice(0, 2), // First 2 sentences
      important: sentences.slice(2, 5),
      contextual: sentences.slice(5, 10),
    },
  };
}

function summarize(text: string, targetLength: number, preserveStructure: boolean): string {
  if (text.length <= targetLength) {
    return text;
  }

  // Simple extractive summarization
  const sentences = text.split(/\. |\n/).filter((s: string) => s.trim());

  // Calculate how many sentences to keep
  const avgSentenceLength = text.length / sentences.length;
  const targetSentences = Math.ceil(targetLength / avgSentenceLength);

  // Keep first, last, and sample middle
  const kept: string[] = [];

  if (sentences.length > 0) {
    kept.push(sentences[0]); // First sentence (usually most important)
  }

  if (sentences.length > 1 && targetSentences > 1) {
    kept.push(sentences[sentences.length - 1]); // Last sentence
  }

  // Add middle sentences if room
  const middleCount = Math.max(0, targetSentences - kept.length);
  if (middleCount > 0 && sentences.length > 2) {
    const step = Math.floor((sentences.length - 2) / (middleCount + 1));
    for (let i = 1; i <= middleCount; i++) {
      const idx = Math.min(i * step, sentences.length - 2);
      if (idx > 0 && idx < sentences.length - 1) {
        kept.splice(kept.length - 1, 0, sentences[idx]);
      }
    }
  }

  return kept.join('. ') + '.';
}
