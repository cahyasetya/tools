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
                console.error('No tool manifest found at /static/js/tools/manifest.json');
                throw new Error('Tool manifest not found');
            }

            this.fullManifest = await manifestResponse.json();
            this.toolManifests = new Map(Object.entries(this.fullManifest.tools || {}));

            console.log(`Discovered ${this.toolManifests.size} tools`);
            return Array.from(this.toolManifests.keys());
        } catch (error) {
            console.error('Failed to load tool manifest:', error);
            throw error;
        }
    }

    /**
     * Get the full manifest data including categories
     */
    getManifest() {
        return this.fullManifest;
    }

    /**
     * Get tools organized by category
     */
    getToolsByCategory() {
        const manifest = this.getManifest();
        if (!manifest) return {};

        const categories = {};
        
        // Initialize categories
        for (const [categoryId, categoryInfo] of Object.entries(manifest.categories || {})) {
            categories[categoryId] = {
                ...categoryInfo,
                tools: []
            };
        }

        // Organize tools by category
        for (const [toolId, toolInfo] of this.toolManifests) {
            const category = toolInfo.category || 'utility';
            if (categories[category]) {
                categories[category].tools.push({
                    id: toolId,
                    ...toolInfo
                });
            }
        }

        // Sort categories by order and tools by name
        const sortedCategories = {};
        Object.entries(categories)
            .sort(([,a], [,b]) => (a.order || 999) - (b.order || 999))
            .forEach(([categoryId, categoryData]) => {
                sortedCategories[categoryId] = {
                    ...categoryData,
                    tools: categoryData.tools.sort((a, b) => a.name.localeCompare(b.name))
                };
            });

        return sortedCategories;
    }

    /**
     * Load essential tools immediately
     */
    async loadEssentialTools() {
        console.log('Loading all discovered tools...');
        
        const allToolIds = Array.from(this.toolManifests.keys());
        const { loaded, failed } = await this.loadTools(allToolIds);
        
        if (failed.length > 0) {
            console.warn('Some tools failed to load:', failed);
        }
        
        return loaded;
    }

    /**
     * Load tools on-demand based on current route
     */
    async loadToolsForRoute(route) {
        // Build route map dynamically from manifest
        const toolsForRoute = [];
        
        for (const [toolId, manifest] of this.toolManifests) {
            if (manifest.routes && manifest.routes.includes(route)) {
                toolsForRoute.push(toolId);
            }
        }

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
        const toolPath = `/static/js/tools/${toolId}/index.js`;
        
        try {
            // Dynamically import the tool module
            const module = await import(toolPath);
            
            if (!module.default) {
                throw new Error(`Tool ${toolId} does not export a default class`);
            }

            // Get tool manifest
            const manifest = this.toolManifests.get(toolId);

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
            console.error(`Failed to load tool ${toolId} via dynamic import:`, error);
            throw error;
        }
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