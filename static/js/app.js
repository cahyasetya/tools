/**
 * Main application initialization and utilities
 */
class CToolsApp {
    constructor() {
        this.currentTool = null;
        this.config = this.loadConfig();
    }

    /**
     * Load application configuration
     */
    loadConfig() {
        return {
            version: '1.0.0',
            theme: 'dark',
            shortcuts: {
                'ctrl+enter': 'submit',
                'ctrl+shift+c': 'copy',
                'escape': 'clear'
            }
        };
    }

    /**
     * Initialize the application
     */
    init() {
        this.initNavigation();
        this.initGlobalShortcuts();
        this.initTheme();
        this.autoInitializeTool();
    }

    /**
     * Initialize navigation highlighting
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
     * Initialize theme
     */
    initTheme() {
        document.documentElement.classList.add('dark');
    }

    /**
     * Auto-initialize tool based on current page
     */
    autoInitializeTool() {
        const path = window.location.pathname;
        let toolType = null;
        
        if (path.includes('/base64')) {
            toolType = 'base64';
        } else if (path.includes('/json-beautify')) {
            toolType = 'json-beautify';
        } else if (path.includes('/json-diff')) {
            toolType = 'json-diff';
        }
        
        if (toolType) {
            this.initializeTool(toolType);
        }
    }

    /**
     * Initialize specific tool
     */
    initializeTool(type) {
        try {
            this.currentTool = ToolFactory.create(type);
            this.currentTool.init();
            console.log(`Initialized ${type} tool`);
        } catch (error) {
            console.error(`Failed to initialize ${type} tool:`, error);
        }
    }

    /**
     * Get application stats
     */
    getStats() {
        return {
            version: this.config.version,
            currentTool: this.currentTool?.config?.name || 'None',
            theme: this.config.theme,
            userAgent: navigator.userAgent
        };
    }
}

/**
 * Utility functions available globally
 */
window.CToolsUtils = {
    /**
     * Format file size
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Check if JSON is valid
     */
    isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Download text as file
     */
    downloadAsFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CToolsApp();
    window.app.init();
});

// Legacy function support for existing onclick handlers
window.legacyFunctions = {
    // Base64
    encodeText: () => window.app.currentTool?.encodeText?.(),
    decodeText: () => window.app.currentTool?.decodeText?.(),
    
    // JSON Beautify  
    beautifyJSON: () => window.app.currentTool?.beautifyJSON?.(),
    minifyJSON: () => window.app.currentTool?.minifyJSON?.(),
    validateJSON: () => window.app.currentTool?.validateJSON?.(),
    clearInput: () => window.app.currentTool?.clearAll?.(),
    
    // JSON Diff
    compareJSON: () => window.app.currentTool?.compareJSON?.(),
    validateJSON1: () => window.app.currentTool?.validateJSON1?.(),
    validateJSON2: () => window.app.currentTool?.validateJSON2?.(),
    clearJSON: (field) => {
        if (field === 'json1-input') window.app.currentTool?.clearJSON1?.();
        if (field === 'json2-input') window.app.currentTool?.clearJSON2?.();
    },
    clearDiff: () => window.app.currentTool?.clearDiff?.(),
    
    // Common
    copyToClipboard: (elementId) => ui.copyElementValue(elementId)
};

// Make legacy functions available globally
Object.assign(window, window.legacyFunctions);