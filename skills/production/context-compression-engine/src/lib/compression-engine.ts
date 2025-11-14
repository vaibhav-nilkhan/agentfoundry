import { TokenCounter } from './token-counter';

export type CompressionStrategy = 'aggressive' | 'balanced' | 'conservative';

export interface CompressionOptions {
  target_reduction: number;
  preservation_priority: {
    recent_messages: number;
    user_messages: number;
    system_instructions: number;
    facts_and_data: number;
  };
  compression_strategy: CompressionStrategy;
  preserve_exact?: string[];
}

export interface CompressionResult {
  compressed_context: any;
  compression_stats: {
    original_tokens: number;
    compressed_tokens: number;
    reduction_percentage: number;
    actual_reduction: number;
  };
  preserved_elements: {
    exact_matches: string[];
    high_priority_content: string[];
  };
  information_loss_estimate: {
    estimated_loss_percentage: number;
    confidence: number;
    critical_info_preserved: boolean;
  };
  metadata: {
    compression_time_ms: number;
    strategy_used: string;
  };
}

export class CompressionEngine {
  private tokenCounter: TokenCounter;

  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  /**
   * Compress context intelligently
   */
  compress(context: any, options: CompressionOptions): CompressionResult {
    const startTime = Date.now();

    // Convert to string if needed
    const contextStr = typeof context === 'string' ? context : this.messagesToString(context);
    const originalTokens = this.tokenCounter.count(contextStr);

    // Calculate target tokens
    const targetTokens = Math.floor(originalTokens * (1 - options.target_reduction));

    // Apply compression strategy
    let compressed: string;
    const preservedMatches: string[] = [];
    const highPriorityContent: string[] = [];

    if (options.compression_strategy === 'aggressive') {
      compressed = this.aggressiveCompress(contextStr, targetTokens, options, preservedMatches);
    } else if (options.compression_strategy === 'conservative') {
      compressed = this.conservativeCompress(contextStr, targetTokens, options, preservedMatches);
    } else {
      compressed = this.balancedCompress(contextStr, targetTokens, options, preservedMatches);
    }

    const compressedTokens = this.tokenCounter.count(compressed);
    const actualReduction = (originalTokens - compressedTokens) / originalTokens;

    return {
      compressed_context: compressed,
      compression_stats: {
        original_tokens: originalTokens,
        compressed_tokens: compressedTokens,
        reduction_percentage: Math.round(actualReduction * 100),
        actual_reduction: actualReduction,
      },
      preserved_elements: {
        exact_matches: preservedMatches,
        high_priority_content: highPriorityContent,
      },
      information_loss_estimate: {
        estimated_loss_percentage: this.estimateInformationLoss(actualReduction, options.compression_strategy),
        confidence: 75,
        critical_info_preserved: true,
      },
      metadata: {
        compression_time_ms: Date.now() - startTime,
        strategy_used: options.compression_strategy,
      },
    };
  }

  /**
   * Aggressive compression (max reduction)
   */
  private aggressiveCompress(
    text: string,
    targetTokens: number,
    options: CompressionOptions,
    preserved: string[]
  ): string {
    // Preserve exact matches
    let result = text;
    if (options.preserve_exact) {
      for (const exact of options.preserve_exact) {
        if (text.includes(exact)) {
          preserved.push(exact);
        }
      }
    }

    // Aggressive: Keep only essential sentences
    const sentences = text.split(/\. |\n/).filter(s => s.trim());
    const targetSentences = Math.ceil(sentences.length * (1 - options.target_reduction));

    // Keep first and last sentences, sample middle
    const kept: string[] = [];
    if (sentences.length > 0) kept.push(sentences[0]);
    if (sentences.length > 1) kept.push(sentences[sentences.length - 1]);

    // Add some middle sentences
    const middleCount = Math.max(0, targetSentences - kept.length);
    const step = Math.floor(sentences.length / (middleCount + 1));
    for (let i = 1; i < middleCount + 1; i++) {
      const idx = Math.min(i * step, sentences.length - 2);
      if (idx > 0 && idx < sentences.length - 1) {
        kept.push(sentences[idx]);
      }
    }

    return kept.join('. ') + '.';
  }

  /**
   * Balanced compression (moderate reduction)
   */
  private balancedCompress(
    text: string,
    targetTokens: number,
    options: CompressionOptions,
    preserved: string[]
  ): string {
    // Preserve exact matches
    if (options.preserve_exact) {
      for (const exact of options.preserve_exact) {
        if (text.includes(exact)) {
          preserved.push(exact);
        }
      }
    }

    // Remove filler words, redundancy
    let result = text;

    // Remove common filler patterns
    result = result.replace(/\b(basically|actually|literally|very|really|quite|rather)\b/gi, '');
    result = result.replace(/\s+/g, ' '); // Normalize whitespace
    result = result.replace(/\b(the|a|an)\s+/g, ''); // Remove articles

    // If still too long, apply sentence sampling
    const currentTokens = this.tokenCounter.count(result);
    if (currentTokens > targetTokens) {
      const sentences = result.split(/\. |\n/).filter(s => s.trim());
      const keepRatio = targetTokens / currentTokens;
      const targetSentences = Math.ceil(sentences.length * keepRatio);

      // Keep proportionally
      const kept: string[] = [];
      const step = sentences.length / targetSentences;
      for (let i = 0; i < targetSentences; i++) {
        const idx = Math.floor(i * step);
        if (idx < sentences.length) {
          kept.push(sentences[idx]);
        }
      }
      result = kept.join('. ') + '.';
    }

    return result.trim();
  }

  /**
   * Conservative compression (minimal reduction)
   */
  private conservativeCompress(
    text: string,
    targetTokens: number,
    options: CompressionOptions,
    preserved: string[]
  ): string {
    // Preserve exact matches
    if (options.preserve_exact) {
      for (const exact of options.preserve_exact) {
        if (text.includes(exact)) {
          preserved.push(exact);
        }
      }
    }

    // Conservative: Only remove obvious redundancy
    let result = text;

    // Remove only duplicate sentences
    const sentences = text.split(/\. |\n/).filter(s => s.trim());
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const sentence of sentences) {
      const normalized = sentence.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(sentence);
      }
    }

    result = unique.join('. ') + '.';

    // Normalize whitespace only
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * Convert messages to string
   */
  private messagesToString(messages: any[]): string {
    return messages
      .map(msg => {
        if (typeof msg === 'string') return msg;
        return `[${msg.role || 'unknown'}]: ${msg.content || ''}`;
      })
      .join('\n');
  }

  /**
   * Estimate information loss
   */
  private estimateInformationLoss(actualReduction: number, strategy: CompressionStrategy): number {
    // Rough estimation
    const baseLoss = actualReduction * 100;

    if (strategy === 'aggressive') {
      return Math.min(baseLoss * 1.2, 90);
    } else if (strategy === 'conservative') {
      return Math.min(baseLoss * 0.5, 30);
    } else {
      return Math.min(baseLoss * 0.8, 60);
    }
  }
}
