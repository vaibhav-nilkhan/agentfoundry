import { run as compressContext } from '../src/tools/compress-context';
import { run as analyzeRelevance } from '../src/tools/analyze-relevance';
import { run as deduplicateSemantic } from '../src/tools/deduplicate-semantic';
import { run as summarizeProgressive } from '../src/tools/summarize-progressive';

describe('Context Compression Engine', () => {
  describe('compress_context', () => {
    it('should compress long text with aggressive strategy', async () => {
      const longText = 'This is a very long piece of text. '.repeat(50);
      const result = await compressContext({
        context: longText,
        target_reduction: 0.7,
        compression_strategy: 'aggressive',
      });

      expect(result).toBeDefined();
      expect(result.compressed_context).toBeDefined();
      expect(result.compression_stats.compressed_tokens).toBeLessThan(
        result.compression_stats.original_tokens
      );
      expect(result.compression_stats.reduction_percentage).toBeGreaterThan(60);
    });

    it('should compress with balanced strategy', async () => {
      const text = 'Actually, this text has basically very many filler words that are really quite unnecessary.';
      const result = await compressContext({
        context: text,
        target_reduction: 0.5,
        compression_strategy: 'balanced',
      });

      expect(result.compressed_context).toBeDefined();
      expect(result.metadata.strategy_used).toBe('balanced');
    });

    it('should track preserved content when specified', async () => {
      const text = 'Some text. IMPORTANT_DATA: critical info. More text.';
      const result = await compressContext({
        context: text,
        target_reduction: 0.6,
        compression_strategy: 'aggressive',
        preserve_exact: ['IMPORTANT_DATA'],
      });

      expect(result.compressed_context).toBeDefined();
      expect(result.preserved_elements.exact_matches).toContain('IMPORTANT_DATA');
    });

    it('should handle message array format', async () => {
      const messages = [
        { role: 'user', content: 'Hello, how are you?' },
        { role: 'assistant', content: 'I am doing well, thank you for asking!' },
        { role: 'user', content: 'Can you help me with a task?' },
      ];

      const result = await compressContext({
        context: messages,
        target_reduction: 0.5,
      });

      expect(result.compressed_context).toBeDefined();
      expect(typeof result.compressed_context).toBe('string');
      expect(result.compression_stats.original_tokens).toBeGreaterThan(0);
    });
  });

  describe('analyze_relevance', () => {
    it('should rank items by relevance score', async () => {
      const context = [
        'User wants to implement authentication',
        'The weather is nice today',
        'Authentication requires user login and password validation',
        'Random unrelated content',
      ];

      const result = await analyzeRelevance({
        context,
        current_task: 'implement user authentication system',
        scoring_factors: {
          recency: 0.2,
          semantic_similarity: 0.5,
          user_importance: 0.2,
          data_density: 0.1,
        },
      });

      expect(result.ranked_items).toBeDefined();
      expect(result.ranked_items.length).toBe(4);
      expect(result.ranked_items[0].relevance_score).toBeGreaterThanOrEqual(
        result.ranked_items[1].relevance_score
      );
      expect(result.summary.total_items).toBe(4);
    });

    it('should return top N items when requested', async () => {
      const context = Array(10)
        .fill(0)
        .map((_, i) => `Item ${i} with some content`);

      const result = await analyzeRelevance({
        context,
        current_task: 'analyze data',
        return_top_n: 5,
      });

      expect(result.ranked_items.length).toBe(5);
    });

    it('should provide recommendations for keep and remove', async () => {
      const context = [
        'Critical system information about authentication',
        'Random noise',
        'Important user data handling',
        'More noise',
      ];

      const result = await analyzeRelevance({
        context,
        current_task: 'implement authentication',
      });

      expect(result.recommendations.must_keep).toBeDefined();
      expect(result.recommendations.safe_to_remove).toBeDefined();
      expect(Array.isArray(result.recommendations.must_keep)).toBe(true);
    });
  });

  describe('deduplicate_semantic', () => {
    it('should remove duplicate content', async () => {
      const content = [
        'The user wants to authenticate',
        'The user wants to authenticate',  // Exact duplicate
        'Complete different topic',
      ];

      const result = await deduplicateSemantic({
        content,
        similarity_threshold: 0.9,  // High threshold for near-exact matches
        preservation_strategy: 'keep_most_detailed',
      });

      expect(result.deduplicated_content).toBeDefined();
      expect(result.deduplicated_content.length).toBeLessThan(content.length);
      expect(result.statistics.items_removed).toBeGreaterThan(0);
    });

    it('should keep most detailed version when duplicates exist', async () => {
      const content = [
        'This is test',
        'This is test with more detail',
      ];

      const result = await deduplicateSemantic({
        content,
        similarity_threshold: 0.7,
        preservation_strategy: 'keep_most_detailed',
      });

      expect(result.deduplicated_content).toBeDefined();
      expect(result.statistics.original_items).toBe(2);
    });

    it('should handle single item without duplicates', async () => {
      const content = ['Unique content'];

      const result = await deduplicateSemantic({
        content,
        similarity_threshold: 0.8,
      });

      expect(result.deduplicated_content.length).toBe(1);
      expect(result.statistics.items_removed).toBe(0);
    });

    it('should calculate similarity correctly', async () => {
      const content = [
        'The quick brown fox jumps',
        'The quick brown dog runs',
        'Completely unrelated sentence',
      ];

      const result = await deduplicateSemantic({
        content,
        similarity_threshold: 0.6,
      });

      expect(result.duplicates_found).toBeDefined();
      expect(result.statistics.space_saved_tokens).toBeGreaterThanOrEqual(0);
    });
  });

  describe('summarize_progressive', () => {
    it('should create multiple levels of summaries', async () => {
      const longContent = 'This is sentence one. This is sentence two. This is sentence three. This is sentence four. This is sentence five. This is sentence six.';

      const result = await summarizeProgressive({
        content: longContent,
        levels: 3,
        target_length_per_level: [100, 50, 20],
      });

      expect(result.summaries).toBeDefined();
      expect(result.summaries.length).toBe(3);
      expect(result.summaries[0].level).toBe(1);
      expect(result.summaries[2].level).toBe(3);
      expect(result.summaries[2].content.length).toBeLessThan(
        result.summaries[0].content.length
      );
    });

    it('should track compression ratios', async () => {
      const content = 'This is sentence one. This is sentence two. This is sentence three. This is sentence four. This is sentence five. This is sentence six. This is sentence seven. This is sentence eight. This is sentence nine. This is sentence ten.';

      const result = await summarizeProgressive({
        content,
        levels: 2,
        target_length_per_level: [100, 50],
      });

      expect(result.summaries[0].compression_ratio).toBeDefined();
      expect(result.summaries[0].compression_ratio).toBeLessThanOrEqual(1);
      expect(result.summaries[1].compression_ratio).toBeDefined();
    });

    it('should extract information hierarchy', async () => {
      const content = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence. Sixth sentence.';

      const result = await summarizeProgressive({
        content,
        levels: 2,
      });

      expect(result.information_hierarchy).toBeDefined();
      expect(result.information_hierarchy.critical).toBeDefined();
      expect(result.information_hierarchy.important).toBeDefined();
      expect(result.information_hierarchy.contextual).toBeDefined();
      expect(result.information_hierarchy.critical.length).toBe(2);
    });

    it('should return final summary', async () => {
      const content = 'Content to summarize. '.repeat(10);

      const result = await summarizeProgressive({
        content,
        levels: 3,
      });

      expect(result.final_summary).toBeDefined();
      expect(result.final_summary).toBe(result.summaries[2].content);
    });
  });
});
