/**
 * Navigation Builder - Dynamically generates navigation from tool manifest
 */
class NavigationBuilder {
    constructor() {
        this.toolLoader = null;
        this.defaultIcons = {
            'encoding': 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            'json': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            'utility': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            'hash': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
            'text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            'web': 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
        };
    }

    /**
     * Initialize with tool loader
     */
    init(toolLoader) {
        this.toolLoader = toolLoader;
    }

    /**
     * Build navigation HTML from manifest
     */
    async buildNavigation() {
        if (!this.toolLoader) {
            console.error('NavigationBuilder not initialized with toolLoader');
            return '';
        }

        const categorizedTools = this.toolLoader.getToolsByCategory();
        let navigationHTML = '';

        // Home link
        navigationHTML += this.buildHomeLink();

        // Build categories and tools
        let shortcutIndex = 1;
        for (const [categoryId, categoryData] of Object.entries(categorizedTools)) {
            if (categoryData.tools.length === 0) continue;

            navigationHTML += this.buildCategoryHeader(categoryData);
            
            for (const tool of categoryData.tools) {
                const route = tool.routes && tool.routes[0] ? tool.routes[0] : `/${tool.id}`;
                const iconPath = this.getIconForCategory(tool.category);
                
                navigationHTML += this.buildToolLink({
                    href: route,
                    name: tool.name,
                    iconPath: iconPath,
                    shortcut: shortcutIndex <= 9 ? shortcutIndex : null
                });
                
                shortcutIndex++;
            }
        }

        return navigationHTML;
    }

    /**
     * Build home link
     */
    buildHomeLink() {
        return `
            <a href="/" class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-1 group">
                <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Home
            </a>
        `;
    }

    /**
     * Build category header
     */
    buildCategoryHeader(categoryData) {
        return `
            <div class="mt-6 mb-3">
                <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ${categoryData.name || 'Tools'}
                </h3>
            </div>
        `;
    }

    /**
     * Build tool link
     */
    buildToolLink({ href, name, iconPath, shortcut }) {
        const shortcutAttr = shortcut ? `data-shortcut="${shortcut}"` : '';
        
        return `
            <a href="${href}" class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-1 group" ${shortcutAttr}>
                <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path>
                </svg>
                ${name}
            </a>
        `;
    }

    /**
     * Get icon SVG path for category
     */
    getIconForCategory(category) {
        return this.defaultIcons[category] || this.defaultIcons['utility'];
    }

    /**
     * Update navigation in the DOM
     */
    async updateNavigation() {
        const navigationContainer = document.querySelector('nav .px-3');
        if (!navigationContainer) {
            console.error('Navigation container not found');
            return;
        }

        const navigationHTML = await this.buildNavigation();
        navigationContainer.innerHTML = navigationHTML;

        // Re-initialize search data
        this.updateSearchData();
    }

    /**
     * Update search data with tools from manifest
     */
    updateSearchData() {
        if (!this.toolLoader) return;

        const categorizedTools = this.toolLoader.getToolsByCategory();
        const searchTools = [];

        for (const [categoryId, categoryData] of Object.entries(categorizedTools)) {
            for (const tool of categoryData.tools) {
                const route = tool.routes && tool.routes[0] ? tool.routes[0] : `/${tool.id}`;
                searchTools.push({
                    name: tool.name,
                    url: route,
                    description: tool.description || '',
                    keywords: tool.tags || []
                });
            }
        }

        // Update global search data if it exists
        if (window.updateSearchTools) {
            window.updateSearchTools(searchTools);
        }
    }
}

// Global navigation builder instance
window.navigationBuilder = new NavigationBuilder();