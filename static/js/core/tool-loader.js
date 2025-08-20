/**
 * Tool Loader - Dynamically loads and manages tool modules
 * Supports hot-reloading and lazy loading
 */
class ToolLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadPromises = new Map();
        this.toolManifests = new Map();
    }

    /**
     * Load a tool module by ID
     */
    async loadTool(toolId) {
        // Return existing promise if already loading
        if (this.loadPromises.has(toolId)) {
            return this.loadPromises.get(toolId);
        }

        // Return immediately if already loaded
        if (this.loadedModules.has(toolId)) {
            return toolRegistry.getTool(toolId);
        }

        const loadPromise = this._loadToolModule(toolId);
        this.loadPromises.set(toolId, loadPromise);

        try {
            const result = await loadPromise;
            this.loadedModules.add(toolId);
            return result;
        } catch (error) {
            console.error(`Failed to load tool ${toolId}:`, error);
            throw error;
        } finally {
            this.loadPromises.delete(toolId);
        }
    }

    /**
     * Load multiple tools concurrently
     */
    async loadTools(toolIds) {
        const loadPromises = toolIds.map(id => this.loadTool(id));
        const results = await Promise.allSettled(loadPromises);
        
        const loaded = [];
        const failed = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                loaded.push(toolIds[index]);
            } else {
                failed.push({ id: toolIds[index], error: result.reason });
            }
        });

        return { loaded, failed };
    }

    /**
     * Discover available tools
     */
    async discoverTools() {
        try {
            // Load tool manifest
            const manifestResponse = await fetch('/static/js/tools/manifest.json');
            if (!manifestResponse.ok) {
                console.warn('No tool manifest found, using default tools');
                return this._loadDefaultTools();
            }

            const manifest = await manifestResponse.json();
            this.toolManifests = new Map(Object.entries(manifest.tools || {}));

            console.log(`Discovered ${this.toolManifests.size} tools`);
            return Array.from(this.toolManifests.keys());
        } catch (error) {
            console.warn('Failed to load tool manifest, using defaults:', error);
            return this._loadDefaultTools();
        }
    }

    /**
     * Load essential tools immediately
     */
    async loadEssentialTools() {
        const essentialTools = ['base64', 'json-beautify', 'json-diff'];
        console.log('Loading essential tools...');
        
        const { loaded, failed } = await this.loadTools(essentialTools);
        
        if (failed.length > 0) {
            console.warn('Some essential tools failed to load:', failed);
        }
        
        return loaded;
    }

    /**
     * Load tools on-demand based on current route
     */
    async loadToolsForRoute(route) {
        const routeToolMap = {
            '/base64': ['base64'],
            '/json-beautify': ['json-beautify'], 
            '/json-diff': ['json-diff'],
            '/hash': ['hash-generator'],
            '/url': ['url-encoder'],
            '/uuid': ['uuid-generator']
        };

        const toolsForRoute = routeToolMap[route] || [];
        if (toolsForRoute.length === 0) {
            return [];
        }

        console.log(`Loading tools for route ${route}:`, toolsForRoute);
        const { loaded } = await this.loadTools(toolsForRoute);
        return loaded;
    }

    /**
     * Internal method to load tool module
     */
    async _loadToolModule(toolId) {
        // For now, use fallback approach since ES6 modules need special handling
        console.log(`Loading tool ${toolId} using fallback method`);
        return this._loadToolFromFallback(toolId);
        
        // TODO: Enable dynamic imports when ready
        /*
        const toolPath = `/static/js/tools/${toolId}/index.js`;
        
        try {
            // Dynamically import the tool module
            const module = await import(toolPath);
            
            if (!module.default) {
                throw new Error(`Tool ${toolId} does not export a default class`);
            }

            // Get tool manifest
            const manifest = this.toolManifests.get(toolId) || this._getDefaultManifest(toolId);

            // Register with tool registry
            const registered = toolRegistry.register({
                id: toolId,
                category: manifest.category || 'misc',
                manifest: manifest,
                toolClass: module.default
            });

            if (!registered) {
                throw new Error(`Failed to register tool ${toolId}`);
            }

            return toolRegistry.getTool(toolId);
        } catch (error) {
            // Fallback: try loading from single tools.js file
            console.warn(`Dynamic import failed for ${toolId}, trying fallback:`, error);
            return this._loadToolFromFallback(toolId);
        }
        */
    }

    /**
     * Fallback to single tools.js file
     */
    async _loadToolFromFallback(toolId) {
        // This assumes the old tools.js is still available
        const classMap = {
            'base64': 'Base64Tool',
            'json-beautify': 'JSONBeautifyTool', 
            'json-diff': 'JSONDiffTool'
        };

        const className = classMap[toolId];
        if (!className || !window[className]) {
            throw new Error(`Tool class ${className} not found`);
        }

        const manifest = this._getDefaultManifest(toolId);
        
        const registered = toolRegistry.register({
            id: toolId,
            category: manifest.category,
            manifest: manifest,
            toolClass: window[className]
        });

        if (!registered) {
            throw new Error(`Failed to register fallback tool ${toolId}`);
        }

        return toolRegistry.getTool(toolId);
    }

    /**
     * Get default manifest for built-in tools
     */
    _getDefaultManifest(toolId) {
        const defaults = {
            'base64': {
                name: 'Base64 Encoder/Decoder',
                version: '1.0.0',
                author: 'CTools',
                description: 'Encode and decode Base64 strings',
                category: 'encoding',
                tags: ['base64', 'encoding', 'decoding']
            },
            'json-beautify': {
                name: 'JSON Beautifier',
                version: '1.0.0', 
                author: 'CTools',
                description: 'Format and validate JSON data',
                category: 'json',
                tags: ['json', 'format', 'beautify', 'validate']
            },
            'json-diff': {
                name: 'JSON Diff',
                version: '1.0.0',
                author: 'CTools', 
                description: 'Compare two JSON objects',
                category: 'json',
                tags: ['json', 'diff', 'compare']
            }
        };

        return defaults[toolId] || {
            name: toolId,
            version: '1.0.0',
            author: 'Unknown',
            description: `${toolId} tool`,
            category: 'misc',
            tags: [toolId]
        };
    }

    /**
     * Load default tools for fallback
     */
    async _loadDefaultTools() {
        return ['base64', 'json-beautify', 'json-diff'];
    }

    /**
     * Hot reload a tool (for development)
     */
    async reloadTool(toolId) {
        console.log(`Hot reloading tool: ${toolId}`);
        
        // Cleanup existing instance
        if (toolRegistry.instances.has(toolId)) {
            const instance = toolRegistry.instances.get(toolId);
            if (typeof instance.cleanup === 'function') {
                instance.cleanup();
            }
            toolRegistry.instances.delete(toolId);
        }

        // Remove from registry
        toolRegistry.tools.delete(toolId);
        this.loadedModules.delete(toolId);

        // Reload
        return this.loadTool(toolId);
    }
}

// Global loader instance
window.toolLoader = new ToolLoader();