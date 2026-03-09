import { BaseParser } from './BaseParser';
import { ClaudeParser } from './claude';
import { CodexParser } from './codex';
import { GeminiParser } from './gemini';
import { AgentType } from '../processMonitor';

export function getParserForAgent(agentName: AgentType | string): BaseParser | null {
    switch (agentName) {
        case 'claude-code':
            return new ClaudeParser();
        case 'codex':
            return new CodexParser();
        case 'gemini':
            return new GeminiParser();
        case 'amp':
            // Amp Code log format is not yet publicly documented.
            return null;
        default:
            return null;
    }
}

export * from './types';
export * from './BaseParser';
