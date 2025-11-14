/**
 * Simple token counter (rough estimation)
 * In production, use tiktoken or similar
 */
export class TokenCounter {
  /**
   * Estimate token count (roughly 4 chars = 1 token)
   */
  count(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Count tokens in message array
   */
  countMessages(messages: Array<{ role: string; content: string }>): number {
    return messages.reduce((total, msg) => {
      return total + this.count(msg.content) + 4; // +4 for message overhead
    }, 0);
  }
}
