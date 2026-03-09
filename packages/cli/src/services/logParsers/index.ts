import { BaseParser } from './BaseParser';
import { ClaudeParser } from './claude';
import { CodexParser } from './codex';
import { GeminiParser } from './gemini';
import { PluginLoader } from './PluginLoader';
import { AgentType } from '../processMonitor';

export function getParserForAgent(agentName: AgentType | string): BaseParser | null {
    // 1. Check built-in parsers
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
    }

    // 2. Fallback to external plugins
    return PluginLoader.loadPlugin(agentName);
}

export * from './types';
export * from './BaseParser';
