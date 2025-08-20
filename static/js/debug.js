/**
 * Debug utilities for CTools
 * Use in browser console to diagnose issues
 */

window.CToolsDebug = {
    /**
     * Check if all systems are loaded
     */
    checkSystems() {
        const systems = {
            api: !!window.api,
            ui: !!window.ui,
            toolRegistry: !!window.toolRegistry,
            toolLoader: !!window.toolLoader,
            appManager: !!window.appManager,
            BaseTool: !!window.BaseTool
        };
        
        console.table(systems);
        
        const missing = Object.entries(systems)
            .filter(([name, loaded]) => !loaded)
            .map(([name]) => name);
            
        if (missing.length === 0) {
            console.log('✅ All systems loaded successfully');
        } else {
            console.error('❌ Missing systems:', missing);
        }
        
        return systems;
    },
    
    /**
     * Check current tool status
     */
    checkCurrentTool() {
        const currentTool = window.appManager?.currentTool;
        
        if (!currentTool) {
            console.log('No tool currently active');
            return null;
        }
        
        console.log('Current Tool:', {
            name: currentTool.config?.name,
            inputFields: currentTool.config?.inputFields,
            outputFields: currentTool.config?.outputFields,
            buttons: currentTool.config?.buttons
        });
        
        return currentTool;
    },
    
    /**
     * Test API connectivity
     */
    async testAPI() {
        console.log('Testing API connectivity...');
        
        try {
            const result = await api.encodeBase64('test');
            if (result.success) {
                console.log('✅ API working:', result.data);
            } else {
                console.error('❌ API error:', result.error);
            }
        } catch (error) {
            console.error('❌ API connection failed:', error);
        }
    },
    
    /**
     * Check styling issues
     */
    checkStyling() {
        const issues = [];
        
        // Check for elements with white backgrounds
        const whiteElements = document.querySelectorAll('[style*="background-color: white"], [style*="background: white"], .bg-white');
        if (whiteElements.length > 0) {
            issues.push(`Found ${whiteElements.length} elements with white backgrounds`);
            whiteElements.forEach(el => console.log('White element:', el));
        }
        
        // Check input/textarea elements
        const inputs = document.querySelectorAll('input, textarea');
        const lightInputs = Array.from(inputs).filter(input => {
            const styles = window.getComputedStyle(input);
            return styles.backgroundColor === 'rgb(255, 255, 255)' || styles.color === 'rgb(0, 0, 0)';
        });
        
        if (lightInputs.length > 0) {
            issues.push(`Found ${lightInputs.length} inputs with light theme`);
            lightInputs.forEach(input => console.log('Light input:', input));
        }
        
        if (issues.length === 0) {
            console.log('✅ No styling issues found');
        } else {
            console.warn('⚠️ Styling issues:', issues);
        }
        
        return issues;
    },
    
    /**
     * Force apply dark theme
     */
    forceApplyDarkTheme() {
        console.log('Force applying dark theme...');
        
        // Ensure dark class on html
        document.documentElement.classList.add('dark');
        
        // Apply dark styles to all inputs and textareas
        document.querySelectorAll('input, textarea').forEach(element => {
            element.style.backgroundColor = 'rgb(55, 65, 81)'; // gray-700
            element.style.borderColor = 'rgb(75, 85, 99)'; // gray-600
            element.style.color = 'rgb(243, 244, 246)'; // gray-100
        });
        
        console.log('✅ Dark theme applied');
    },
    
    /**
     * Check tool registry
     */
    checkRegistry() {
        if (!window.toolRegistry) {
            console.error('❌ Tool registry not loaded');
            return;
        }
        
        const stats = toolRegistry.getStats();
        console.log('Tool Registry Stats:', stats);
        
        const tools = Array.from(toolRegistry.tools.values());
        console.table(tools.map(tool => ({
            id: tool.id,
            name: tool.manifest.name,
            category: tool.category,
            active: tool.active
        })));
    },
    
    /**
     * Run all diagnostics
     */
    runDiagnostics() {
        console.log('🔍 Running CTools Diagnostics...');
        console.log('=====================================');
        
        this.checkSystems();
        console.log('');
        
        this.checkCurrentTool();
        console.log('');
        
        this.checkRegistry();
        console.log('');
        
        this.checkStyling();
        console.log('');
        
        this.testAPI();
        
        console.log('=====================================');
        console.log('✅ Diagnostics complete');
    }
};

// Auto-run diagnostics in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        CToolsDebug.runDiagnostics();
    }, 2000);
}