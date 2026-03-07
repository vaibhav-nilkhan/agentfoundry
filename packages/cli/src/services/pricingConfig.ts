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
        defaultModel: 'claude-sonnet-4-20250514',
        models: {
            'claude-sonnet-4-20250514': {
                inputPerMillion: 3.00,
                outputPerMillion: 15.00
            },
            'claude-3-5-sonnet-20241022': {
                inputPerMillion: 3.00,
                outputPerMillion: 15.00
            },
            'claude-3-5-haiku-20241022': {
                inputPerMillion: 0.80,
                outputPerMillion: 4.00
            },
            'claude-opus-4-20250514': {
                inputPerMillion: 15.00,
                outputPerMillion: 75.00
            }
        }
    },
    'codex': {
        defaultModel: 'codex-mini-latest',
        models: {
            'codex-mini-latest': {
                inputPerMillion: 1.50,
                outputPerMillion: 6.00
            },
            'o3': {
                inputPerMillion: 2.00,
                outputPerMillion: 8.00
            }
        }
    },
    'gemini': {
        defaultModel: 'gemini-2.5-pro',
        models: {
            'gemini-2.5-pro': {
                inputPerMillion: 1.25,
                outputPerMillion: 10.00
            },
            'gemini-2.5-flash': {
                inputPerMillion: 0.15,
                outputPerMillion: 0.60
            }
        }
    }
};

/**
 * Calculates the USD cost for a given token usage.
 */
export function calculateTokenCost(
    agentName: string,
    tokensIn: number,
    tokensOut: number,
    modelName?: string
): number {
    const agentConfig = AGENT_PRICING[agentName];
    if (!agentConfig) {
        return 0;
    }

    const model = modelName || agentConfig.defaultModel;
    const pricing = agentConfig.models[model];
    if (!pricing) {
        return 0;
    }

    const inputCost = (tokensIn / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (tokensOut / 1_000_000) * pricing.outputPerMillion;

    return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}
