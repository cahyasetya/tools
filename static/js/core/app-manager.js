/**
 * Application Manager - Central coordinator for the entire application
 * Handles initialization, routing, and tool lifecycle
 */
class AppManager {
    constructor() {
        this.currentTool = null;
        this.config = this.loadConfig();
        this.isInitialized = false;
        this.initPromise = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = this._performInit();
        await this.initPromise;
        this.isInitialized = true;
    }

    /**
     * Perform actual initialization
     */
    async _performInit() {
        console.log('🚀 Initializing CTools Application');
        
        try {
            // Initialize core systems
            await this.initializeCore();
            
            // Discover and load tools
            await this.initializeTools();
            
            // Setup UI
            this.initializeUI();
            
            // Handle current route
            await this.handleCurrentRoute();
            
            console.log('✅ CTools Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize CTools:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCore() {
        console.log('Initializing core systems...');
        
        // Initialize theme
        this.initTheme();
        
        // Initialize navigation
        this.initNavigation();
        
        // Initialize global shortcuts
        this.initGlobalShortcuts();
        
        // Initialize error handling
        this.initErrorHandling();
    }

    /**
     * Initialize tools system
     */
    async initializeTools() {
        console.log('Discovering and loading tools...');
        
        // Discover available tools
        const availableTools = await toolLoader.discoverTools();
        console.log(`Found ${availableTools.length} available tools`);
        
        // Load essential tools
        const essentialTools = await toolLoader.loadEssentialTools();
        console.log(`Loaded ${essentialTools.length} essential tools`);
        
        // Load tools for current route
        const routeTools = await toolLoader.loadToolsForRoute(window.location.pathname);
        console.log(`Loaded ${routeTools.length} tools for current route`);
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        console.log('Initializing UI components...');
        
        // Initialize UI manager
        ui.initializeEnhancements();
        
        // Update navigation
        this.updateNavigation();
        
        // Initialize page-specific UI
        this.initializePageUI();
    }

    /**
     * Handle current route
     */
    async handleCurrentRoute() {
        const route = window.location.pathname;
        console.log(`Handling route: ${route}`);
        
        // Determine which tool to initialize
        const toolId = this.getToolIdFromRoute(route);
        
        if (toolId) {
            await this.initializeTool(toolId);
        } else {
            console.log('No specific tool for this route');
        }
    }

    /**
     * Get tool ID from current route
     */
    getToolIdFromRoute(route) {
        const routeMap = {
            '/base64': 'base64',
            '/json-beautify': 'json-beautify',
            '/json-diff': 'json-diff',
            '/url-encode': 'url-encoder',
            '/hash': 'hash-generator',
            '/uuid': 'uuid-generator',
            '/jwt': 'jwt-decoder',
            '/color': 'color-picker',
            '/qr': 'qr-generator',
            '/regex': 'regex-tester'
        };
        
        return routeMap[route] || null;
    }

    /**
     * Initialize specific tool
     */
    async initializeTool(toolId) {
        try {
            console.log(`Initializing tool: ${toolId}`);
            
            // Load tool if not already loaded
            await toolLoader.loadTool(toolId);
            
            // Create tool instance
            this.currentTool = await toolRegistry.createInstance(toolId);
            
            console.log(`✅ Tool ${toolId} initialized successfully`);
            
            // Update page title
            this.updatePageTitle(this.currentTool.config.name);
            
        } catch (error) {
            console.error(`Failed to initialize tool ${toolId}:`, error);
            ui.showMessage(`Failed to load ${toolId} tool`, 'error');
        }
    }

    /**
     * Initialize theme
     */
    initTheme() {
        document.documentElement.classList.add('dark');
        
        // Load user preferences
        const savedTheme = localStorage.getItem('ctools-theme');
        if (savedTheme) {
            this.config.theme = savedTheme;
        }
    }

    /**
     * Initialize navigation
     */
    initNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.classList.remove('bg-gray-700', 'text-white');
            link.classList.add('text-gray-300');
            
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('bg-gray-700', 'text-white');
                link.classList.remove('text-gray-300');
            }
        });
    }

    /**
     * Update navigation with tools from registry
     */
    updateNavigation() {
        const categories = toolRegistry.getCategories();
        // This would update the sidebar with dynamically loaded tools
        // Implementation depends on your navigation structure
    }

    /**
     * Initialize global keyboard shortcuts
     */
    initGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit current form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.handleShortcut('submit', e);
            }
            
            // Escape to clear current form
            if (e.key === 'Escape') {
                this.handleShortcut('clear', e);
            }
            
            // Ctrl/Cmd + Shift + C to copy output
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                this.handleShortcut('copy', e);
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleShortcut(action, event) {
        switch (action) {
            case 'submit':
                const primaryButton = document.querySelector('button[class*="bg-blue"], button[class*="bg-green"], button[class*="bg-purple"]');
                if (primaryButton && !primaryButton.disabled) {
                    primaryButton.click();
                    event.preventDefault();
                }
                break;
                
            case 'clear':
                if (this.currentTool && typeof this.currentTool.clearFields === 'function') {
                    this.currentTool.clearFields();
                    event.preventDefault();
                }
                break;
                
            case 'copy':
                const outputField = document.querySelector('textarea[readonly], pre[id*="output"]');
                if (outputField && outputField.textContent.trim()) {
                    ui.copyToClipboard(outputField.textContent);
                    event.preventDefault();
                }
                break;
        }
    }

    /**
     * Initialize error handling
     */
    initErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            ui.showMessage('An unexpected error occurred', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            ui.showMessage('An unexpected error occurred', 'error');
        });
    }

    /**
     * Initialize page-specific UI
     */
    initializePageUI() {
        // Add any page-specific UI initialization here
        this.initializeTooltips();
        this.initializeAnimations();
    }

    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        // Basic tooltip implementation
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                // Simple tooltip logic can be added here
            });
        });
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        // Add subtle animations for better UX
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                button.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 100);
            });
        });
    }

    /**
     * Update page title
     */
    updatePageTitle(toolName) {
        if (toolName) {
            document.title = `${toolName} - CTools`;
        } else {
            document.title = 'CTools - Developer Utilities';
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'fixed top-4 right-4 bg-red-900 text-red-100 p-4 rounded-lg border border-red-700 z-50';
        errorContainer.innerHTML = `
            <h3 class="font-bold">Initialization Error</h3>
            <p>CTools failed to initialize properly. Some features may not work.</p>
            <button onclick="this.parentElement.remove()" class="mt-2 text-sm underline">Dismiss</button>
        `;
        document.body.appendChild(errorContainer);
    }

    /**
     * Load application configuration
     */
    loadConfig() {
        const defaults = {
            version: '1.0.0',
            theme: 'dark',
            autoSave: true,
            shortcuts: true
        };

        const saved = localStorage.getItem('ctools-config');
        if (saved) {
            try {
                return { ...defaults, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to load saved config, using defaults');
            }
        }

        return defaults;
    }

    /**
     * Save configuration
     */
    saveConfig() {
        localStorage.setItem('ctools-config', JSON.stringify(this.config));
    }

    /**
     * Get application statistics
     */
    getStats() {
        return {
            version: this.config.version,
            currentTool: this.currentTool?.config?.name || 'None',
            theme: this.config.theme,
            toolStats: toolRegistry.getStats(),
            userAgent: navigator.userAgent,
            initialized: this.isInitialized
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.currentTool && typeof this.currentTool.cleanup === 'function') {
            this.currentTool.cleanup();
        }
        
        toolRegistry.cleanup();
        this.saveConfig();
    }
}

// Global app manager instance
window.appManager = new AppManager();

// Legacy support
window.app = window.appManager;