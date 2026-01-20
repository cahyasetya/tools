/**
 * CTools UI Framework - Declarative UI Builder
 * Makes creating consistent, responsive UIs fast and easy
 */
class UIBuilder {
    constructor() {
        this.theme = this.getTheme();
        this.components = new Map();
        this.layouts = new Map();
        this.initializeComponents();
    }

    /**
     * Get theme configuration
     */
    getTheme() {
        return {
            colors: {
                primary: 'blue',
                secondary: 'green', 
                accent: 'purple',
                success: 'green',
                warning: 'yellow',
                error: 'red',
                info: 'blue',
                neutral: 'gray'
            },
            sizes: {
                xs: 'text-xs px-2 py-1',
                sm: 'text-sm px-3 py-2', 
                md: 'text-base px-4 py-2',
                lg: 'text-lg px-6 py-3',
                xl: 'text-xl px-8 py-4'
            },
            spacing: {
                xs: 'gap-2',
                sm: 'gap-4',
                md: 'gap-6', 
                lg: 'gap-8',
                xl: 'gap-12'
            }
        };
    }

    /**
     * Initialize built-in components
     */
    initializeComponents() {
        // Register common components
        this.registerComponent('input', this.createInput.bind(this));
        this.registerComponent('textarea', this.createTextarea.bind(this));
        this.registerComponent('button', this.createButton.bind(this));
        this.registerComponent('card', this.createCard.bind(this));
        this.registerComponent('form', this.createForm.bind(this));
        this.registerComponent('stats', this.createStats.bind(this));
        this.registerComponent('message', this.createMessage.bind(this));
    }

    /**
     * Register a new component
     */
    registerComponent(name, builder) {
        this.components.set(name, builder);
    }

    /**
     * Build a complete tool UI from configuration
     */
    buildToolUI(config) {
        const { title, maxWidth = '7xl', layout = 'two-column', sections = [] } = config;
        
        let html = `<div class="max-w-${maxWidth} mx-auto">`;
        
        // Add title
        if (title) {
            html += this.createTitle(title);
        }

        // Create layout
        if (layout === 'two-column') {
            html += `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">`;
        } else if (layout === 'three-column') {
            html += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
        } else if (layout === 'single-column') {
            html += `<div class="space-y-6">`;
        }

        // Add sections
        sections.forEach(section => {
            html += this.buildSection(section);
        });

        // Close layout
        html += '</div>';

        // Add message area
        html += this.createMessage({ id: 'message', hidden: true });
        
        html += '</div>';
        return html;
    }

    /**
     * Build a section from configuration
     */
    buildSection(config) {
        const { 
            title, 
            type = 'card',
            fields = [],
            buttons = [],
            stats = [],
            className = ''
        } = config;

        if (type === 'card') {
            return this.createCard({
                title,
                className,
                content: this.buildSectionContent(fields, buttons, stats)
            });
        } else if (type === 'stats') {
            return this.createStats({ items: stats, className });
        }

        return this.buildSectionContent(fields, buttons, stats);
    }

    /**
     * Build section content
     */
    buildSectionContent(fields = [], buttons = [], stats = []) {
        let content = '<div class="space-y-4">';

        // Add fields
        fields.forEach(field => {
            content += this.buildField(field);
        });

        // Add button groups
        if (buttons.length > 0) {
            content += this.buildButtonGroup(buttons);
        }

        // Add stats
        if (stats.length > 0) {
            content += this.createStats({ items: stats });
        }

        content += '</div>';
        return content;
    }

    /**
     * Build a form field
     */
    buildField(config) {
        const { type = 'input', ...props } = config;
        const component = this.components.get(type);
        
        if (!component) {
            console.warn(`Unknown component type: ${type}`);
            return '';
        }

        return component(props);
    }

    /**
     * Build button group
     */
    buildButtonGroup(buttons) {
        if (buttons.length === 0) return '';

        const hasFullWidth = buttons.some(btn => btn.fullWidth);
        
        if (hasFullWidth) {
            // Stack full-width buttons vertically
            return buttons.map(btn => this.createButton(btn)).join('');
        } else {
            // Group buttons horizontally
            const buttonHtml = buttons.map(btn => this.createButton({
                ...btn,
                className: `flex-1 ${btn.className || ''}`
            })).join('');
            
            return `<div class="flex space-x-4">${buttonHtml}</div>`;
        }
    }

    /**
     * Create title
     */
    createTitle(title, size = '3xl') {
        return `<h1 class="text-${size} font-bold text-gray-100 mb-8">${title}</h1>`;
    }

    /**
     * Create input component
     */
    createInput(config) {
        const {
            id,
            label,
            type = 'text',
            placeholder = '',
            required = false,
            readonly = false,
            value = '',
            className = ''
        } = config;

        const requiredAttr = required ? 'required' : '';
        const readonlyAttr = readonly ? 'readonly' : '';
        const baseClasses = 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        
        return `
            <div>
                ${label ? `<label for="${id}" class="block text-sm font-medium text-gray-300 mb-2">${label}</label>` : ''}
                <input 
                    type="${type}" 
                    id="${id}" 
                    placeholder="${placeholder}"
                    value="${value}"
                    class="${baseClasses} ${className}"
                    ${requiredAttr}
                    ${readonlyAttr}
                />
            </div>
        `;
    }

    /**
     * Create textarea component
     */
    createTextarea(config) {
        const {
            id,
            label,
            placeholder = '',
            rows = 6,
            required = false,
            readonly = false,
            value = '',
            monospace = false,
            className = ''
        } = config;

        const requiredAttr = required ? 'required' : '';
        const readonlyAttr = readonly ? 'readonly' : '';
        const fontClass = monospace ? 'font-mono text-sm' : '';
        const baseClasses = `w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`;

        return `
            <div>
                ${label ? `<label for="${id}" class="block text-sm font-medium text-gray-300 mb-2">${label}</label>` : ''}
                <textarea 
                    id="${id}"
                    rows="${rows}"
                    placeholder="${placeholder}"
                    class="${baseClasses} ${className}"
                    ${requiredAttr}
                    ${readonlyAttr}
                >${value}</textarea>
            </div>
        `;
    }

    /**
     * Create button component
     */
    createButton(config) {
        const {
            id,
            text,
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            disabled = false,
            loading = false,
            className = ''
        } = config;

        const variants = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-green-600 hover:bg-green-700 text-white',
            accent: 'bg-purple-600 hover:bg-purple-700 text-white',
            neutral: 'bg-gray-600 hover:bg-gray-700 text-white',
            danger: 'bg-red-600 hover:bg-red-700 text-white'
        };

        const variantClass = variants[variant] || variants.primary;
        const sizeClass = this.theme.sizes[size] || this.theme.sizes.md;
        const widthClass = fullWidth ? 'w-full' : '';
        const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
        const baseClasses = 'font-medium rounded-md transition-colors';

        return `
            <button 
                id="${id}"
                class="${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${disabledClass} ${className}"
                ${disabled ? 'disabled' : ''}
            >
                ${loading ? '<span class="animate-pulse">⏳</span> ' : ''}${text}
            </button>
        `;
    }

    /**
     * Create card component
     */
    createCard(config) {
        const {
            title,
            content,
            className = ''
        } = config;

        return `
            <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 ${className}">
                ${title ? `<h2 class="text-xl font-semibold text-gray-100 mb-4">${title}</h2>` : ''}
                ${content}
            </div>
        `;
    }

    /**
     * Create stats component
     */
    createStats(config) {
        const { items = [], className = '' } = config;
        
        const statsHtml = items.map(item => `
            <div class="text-center p-4 bg-gray-700 rounded-lg">
                <div class="text-2xl font-bold text-${item.color || 'blue'}-400" id="${item.id || ''}">${item.value || '0'}</div>
                <div class="text-sm text-gray-400">${item.label}</div>
            </div>
        `).join('');

        return `
            <div class="grid grid-cols-1 md:grid-cols-${Math.min(items.length, 3)} gap-4 ${className}">
                ${statsHtml}
            </div>
        `;
    }

    /**
     * Create message component
     */
    createMessage(config) {
        const { id = 'message', hidden = true, className = '' } = config;
        const hiddenClass = hidden ? 'hidden' : '';
        
        return `<div id="${id}" class="mt-4 p-4 rounded-md ${hiddenClass} ${className}"></div>`;
    }

    /**
     * Create form wrapper
     */
    createForm(config) {
        const { id, fields = [], buttons = [], className = '' } = config;
        
        let formHtml = `<form id="${id}" class="space-y-4 ${className}">`;
        
        // Add fields
        fields.forEach(field => {
            formHtml += this.buildField(field);
        });

        // Add buttons
        if (buttons.length > 0) {
            formHtml += this.buildButtonGroup(buttons);
        }

        formHtml += '</form>';
        return formHtml;
    }

    /**
     * Quick builder methods for common patterns
     */
    buildInputOutputTool(config) {
        const {
            title,
            inputSection,
            outputSection,
            statsSection,
            maxWidth = '7xl'
        } = config;

        const sections = [];

        if (inputSection) sections.push(inputSection);
        if (outputSection) sections.push(outputSection);
        if (statsSection) sections.push({ ...statsSection, type: 'stats' });

        return this.buildToolUI({
            title,
            maxWidth,
            layout: inputSection && outputSection ? 'two-column' : 'single-column',
            sections
        });
    }

    buildSingleFormTool(config) {
        const { title, fields = [], buttons = [], stats = [], maxWidth = '6xl' } = config;

        return this.buildToolUI({
            title,
            maxWidth,
            layout: 'single-column',
            sections: [
                {
                    title: null,
                    fields,
                    buttons,
                    stats
                }
            ]
        });
    }
}

// Export for global use
window.UIBuilder = UIBuilder;