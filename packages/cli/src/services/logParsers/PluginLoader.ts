import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BaseParser } from './BaseParser';

export class PluginLoader {
    private static readonly PLUGIN_DIR = path.join(os.homedir(), '.agentfoundry', 'plugins');

    /**
     * Attempts to load an external parser plugin for a given agent name.
     */
    public static loadPlugin(agentName: string): BaseParser | null {
        try {
            // Ensure plugin directory exists
            if (!fs.existsSync(this.PLUGIN_DIR)) {
                fs.mkdirSync(this.PLUGIN_DIR, { recursive: true });
                return null;
            }

            // Look for <agentName>.js or <agentName>/index.js
            const directPath = path.join(this.PLUGIN_DIR, `${agentName}.js`);
            const indexPath = path.join(this.PLUGIN_DIR, agentName, 'index.js');

            let pluginPath: string | null = null;
            if (fs.existsSync(directPath)) {
                pluginPath = directPath;
            } else if (fs.existsSync(indexPath)) {
                pluginPath = indexPath;
            }

            if (!pluginPath) {
                return null;
            }

            // Dynamically require the plugin
            // Note: In a production CLI, we might need more robust loading logic 
            // to handle ESM/CJS differences or use import()
            const PluginClass = require(pluginPath);
            
            // The plugin should export a class as the default export or the only export
            const instance = typeof PluginClass === 'function' 
                ? new PluginClass() 
                : (PluginClass.default ? new PluginClass.default() : null);

            if (instance && typeof instance.parseLogs === 'function') {
                return instance as BaseParser;
            }

            console.warn(`[PluginLoader] Plugin at ${pluginPath} does not implement parseLogs method.`);
            return null;

        } catch (error) {
            console.error(`[PluginLoader] Failed to load plugin for ${agentName}:`, error);
            return null;
        }
    }

    /**
     * Lists all available external plugins.
     */
    public static listPlugins(): string[] {
        if (!fs.existsSync(this.PLUGIN_DIR)) return [];
        
        try {
            return fs.readdirSync(this.PLUGIN_DIR)
                .filter(file => file.endsWith('.js'))
                .map(file => file.replace('.js', ''));
        } catch {
            return [];
        }
    }
}
