/**
 * Tool Registry - Central hub for tool management
 * Handles tool registration, discovery, and lifecycle
 */
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.categories = new Map();
        this.instances = new Map();
        this.loadOrder = [];
    }

    /**
     * Register a tool with the system
     */
    register(toolConfig) {
        const { id, category, manifest, toolClass } = toolConfig;
        
        if (this.tools.has(id)) {
            console.warn(`Tool ${id} already registered, skipping`);
            return false;
        }

        // Validate tool configuration
        if (!this.validateTool(toolConfig)) {
            console.error(`Invalid tool configuration for ${id}`);
            return false;
        }

        // Register tool
        this.tools.set(id, {
            id,
            category: category || 'misc',
            manifest,
            toolClass,
            registered: new Date(),
            active: true
        });

        // Register category
        this.registerCategory(category || 'misc', manifest.categoryInfo);

        // Track load order
        this.loadOrder.push(id);

        console.log(`✓ Registered tool: ${id}`);
        return true;
    }

    /**
     * Register a tool category
     */
    registerCategory(categoryId, categoryInfo = {}) {
        if (!this.categories.has(categoryId)) {
            this.categories.set(categoryId, {
                id: categoryId,
                name: categoryInfo.name || categoryId,
                description: categoryInfo.description || '',
                icon: categoryInfo.icon || '🔧',
                tools: [],
                order: categoryInfo.order || 999
            });
        }

        // Add tool to category
        const category = this.categories.get(categoryId);
        const toolId = categoryInfo.toolId;
        if (toolId && !category.tools.includes(toolId)) {
            category.tools.push(toolId);
        }
    }

    /**
     * Get tool by ID
     */
    getTool(id) {
        return this.tools.get(id);
    }

    /**
     * Get all tools in a category
     */
    getToolsByCategory(categoryId) {
        return Array.from(this.tools.values())
            .filter(tool => tool.category === categoryId)
            .sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
    }

    /**
     * Get all categories
     */
    getCategories() {
        return Array.from(this.categories.values())
            .sort((a, b) => a.order - b.order);
    }

    /**
     * Initialize a tool instance
     */
    async createInstance(toolId) {
        const toolConfig = this.getTool(toolId);
        if (!toolConfig) {
            throw new Error(`Tool ${toolId} not found`);
        }

        // Return existing instance if available
        if (this.instances.has(toolId)) {
            return this.instances.get(toolId);
        }

        try {
            const instance = new toolConfig.toolClass();
            await instance.init();
            
            this.instances.set(toolId, instance);
            console.log(`✓ Initialized tool instance: ${toolId}`);
            
            return instance;
        } catch (error) {
            console.error(`Failed to initialize tool ${toolId}:`, error);
            throw error;
        }
    }

    /**
     * Validate tool configuration
     */
    validateTool(config) {
        const required = ['id', 'manifest', 'toolClass'];
        const manifestRequired = ['name', 'version', 'author'];

        // Check required fields
        for (const field of required) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Check manifest
        for (const field of manifestRequired) {
            if (!config.manifest[field]) {
                console.error(`Missing required manifest field: ${field}`);
                return false;
            }
        }

        // Validate tool class
        if (typeof config.toolClass !== 'function') {
            console.error('toolClass must be a constructor function');
            return false;
        }

        return true;
    }

    /**
     * Get tool statistics
     */
    getStats() {
        return {
            totalTools: this.tools.size,
            categories: this.categories.size,
            activeInstances: this.instances.size,
            loadOrder: this.loadOrder
        };
    }

    /**
     * Search tools
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.tools.values()).filter(tool => {
            const manifest = tool.manifest;
            return (
                manifest.name.toLowerCase().includes(lowerQuery) ||
                manifest.description.toLowerCase().includes(lowerQuery) ||
                (manifest.tags && manifest.tags.some(tag => 
                    tag.toLowerCase().includes(lowerQuery)
                ))
            );
        });
    }

    /**
     * Cleanup unused instances
     */
    cleanup() {
        let cleaned = 0;
        for (const [toolId, instance] of this.instances) {
            if (instance.isIdle && instance.isIdle()) {
                if (typeof instance.cleanup === 'function') {
                    instance.cleanup();
                }
                this.instances.delete(toolId);
                cleaned++;
            }
        }
        console.log(`Cleaned up ${cleaned} idle tool instances`);
    }
}

// Global registry instance
window.toolRegistry = new ToolRegistry();