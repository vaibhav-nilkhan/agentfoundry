import { UsageBreakdown } from './logParsers/types';

/**
 * Agent Pricing Configuration
 * Community-maintainable pricing data for AI coding agents.
 * Prices are per 1M tokens in USD.
 */

export interface ModelPricing {
    inputPerMillion: number;
    outputPerMillion: number;
}

export interface AgentPricingConfig {
    [agentName: string]: {
        defaultModel: string;
        models: {
            [modelName: string]: ModelPricing;
        };
    };
}

export const AGENT_PRICING: AgentPricingConfig = {
    'claude-code': {
        defaultModel: 'claude-4-6-sonnet-20260115',
        models: {
            'claude-4-6-sonnet-20260115': {
                inputPerMillion: 2.50,
                outputPerMillion: 12.00
            },
            'claude-4-6-haiku-20260115': {
                inputPerMillion: 0.50,
                outputPerMillion: 2.50
            },
            'claude-4-6-opus-20260210': {
                inputPerMillion: 12.00,
                outputPerMillion: 60.00
            }
        }
    },
    'codex': {
        defaultModel: 'codex-5-3-turbo',
        models: {
            'codex-5-3-turbo': {
                inputPerMillion: 1.00,
                outputPerMillion: 4.00
            },
            'codex-5-3-pro': {
                inputPerMillion: 2.50,
                outputPerMillion: 10.00
            }
        }
    },
    'gemini': {
        defaultModel: 'gemini-3-1-pro',
        models: {
            'gemini-3-1-pro': {
                inputPerMillion: 1.00,
                outputPerMillion: 8.00
            },
            'gemini-3-1-flash': {
                inputPerMillion: 0.10,
                outputPerMillion: 0.40
            }
        }
    },
    'amp': {
        defaultModel: 'gpt-5-4-omni',
        models: {
            'gpt-5-4-omni': {
                inputPerMillion: 8.00,
                outputPerMillion: 24.00
            },
            'gpt-5-4-mini': {
                inputPerMillion: 0.15,
                outputPerMillion: 0.60
            },
            'claude-4-6-sonnet-20260115': {
                inputPerMillion: 2.50,
                outputPerMillion: 12.00
            },
            'claude-4-6-haiku-20260115': {
                inputPerMillion: 0.50,
                outputPerMillion: 2.50
            }
        }
    }
};

/**
 * Calculates the USD cost for a given token usage.
 * If a granular breakdown array is provided, it calculates exact cost per model,
 * including multipliers for reasoning effort (thinking tokens).
 */
export function calculateTokenCost(
    agentName: string,
    tokensIn: number,
    tokensOut: number,
    modelName?: string,
    breakdown?: UsageBreakdown[]
): number {
    const agentConfig = AGENT_PRICING[agentName];
    if (!agentConfig) {
        return 0;
    }

    let totalCost = 0;

    // 1. Calculate exact cost based on Multi-Model breakdown (if available)
    if (breakdown && breakdown.length > 0) {
        for (const item of breakdown) {
            const pricing = agentConfig.models[item.model];
            if (pricing) {
                const inputCost = (item.inputTokens / 1_000_000) * pricing.inputPerMillion;
                
                // For models with reasoning (o1, o3, gpt-5, claude-3.7+), thinking tokens might have a premium
                let outputTokens = item.outputTokens;
                let outputMultiplier = 1.0;

                // If high reasoning effort is detected, we apply the 'thinking' tax
                if (item.reasoningEffort === 'high' || item.reasoningEffort === 'xhigh') {
                    outputMultiplier = 1.25; // 20% premium for deep thinking effort
                }

                const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion * outputMultiplier;
                totalCost += (inputCost + outputCost);
            }
        }
        return Math.round(totalCost * 1_000_000) / 1_000_000;
    }

    // 2. Fallback to single model tracking
    const model = modelName || agentConfig.defaultModel;
    const pricing = agentConfig.models[model];
    if (!pricing) {
        return 0;
    }

    const inputCost = (tokensIn / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (tokensOut / 1_000_000) * pricing.outputPerMillion;
    
    totalCost = inputCost + outputCost;

    return Math.round(totalCost * 1_000_000) / 1_000_000;
}
