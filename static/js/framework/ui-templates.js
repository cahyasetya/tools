/**
 * CTools UI Templates - Pre-built templates for common tool patterns
 * Provides instant UI generation for typical developer tool layouts
 */
class UITemplates {
    constructor() {
        this.builder = new UIBuilder();
    }

    /**
     * Template: Text Input/Output Tool (Base64, URL Encoder, etc.)
     */
    textProcessingTool(config) {
        const {
            title,
            inputLabel = 'Input',
            outputLabel = 'Output', 
            inputPlaceholder = 'Enter text...',
            outputPlaceholder = 'Result will appear here...',
            primaryAction = 'Process',
            secondaryAction = null,
            showStats = true,
            inputRows = 6,
            outputRows = 6,
            monospace = false
        } = config;

        const inputSection = {
            title: inputLabel,
            fields: [
                {
                    type: 'textarea',
                    id: `${this.getIdPrefix(title)}-input`,
                    label: `${inputLabel}`,
                    placeholder: inputPlaceholder,
                    rows: inputRows,
                    monospace
                }
            ],
            buttons: [
                {
                    id: `${this.getIdPrefix(title)}-btn`,
                    text: primaryAction,
                    variant: 'primary',
                    fullWidth: !secondaryAction
                },
                ...(secondaryAction ? [{
                    id: `${this.getIdPrefix(title)}-secondary-btn`,
                    text: secondaryAction,
                    variant: 'secondary'
                }] : []),
                {
                    id: `clear-${this.getIdPrefix(title)}-btn`,
                    text: 'Clear',
                    variant: 'neutral',
                    fullWidth: true
                }
            ]
        };

        const outputSection = {
            title: outputLabel,
            fields: [
                {
                    type: 'textarea',
                    id: `${this.getIdPrefix(title)}-output`,
                    label: outputLabel,
                    placeholder: outputPlaceholder,
                    rows: outputRows,
                    readonly: true,
                    monospace
                }
            ],
            buttons: [
                {
                    id: `copy-${this.getIdPrefix(title)}-btn`,
                    text: 'Copy Result',
                    variant: 'neutral',
                    fullWidth: true
                }
            ]
        };

        const statsSection = showStats ? {
            className: 'mt-6',
            items: [
                { id: 'char-count', label: 'Characters', value: '0', color: 'blue' },
                { id: 'line-count', label: 'Lines', value: '0', color: 'green' },
                { id: 'size-bytes', label: 'Bytes', value: '0', color: 'purple' }
            ]
        } : null;

        return this.builder.buildInputOutputTool({
            title,
            inputSection,
            outputSection,
            statsSection
        });
    }

    /**
     * Template: JSON Processing Tool (Beautifier, Diff, etc.)
     */
    jsonProcessingTool(config) {
        const {
            title,
            inputLabel = 'Raw JSON Input',
            outputLabel = 'Formatted JSON Output',
            actions = ['Beautify', 'Minify', 'Validate'],
            showStats = true
        } = config;

        return this.textProcessingTool({
            ...config,
            inputLabel,
            outputLabel,
            inputPlaceholder: '{"key": "value", "nested": {"array": [1, 2, 3]}}',
            outputPlaceholder: 'Formatted JSON will appear here...',
            primaryAction: actions[0],
            secondaryAction: actions[1],
            monospace: true,
            inputRows: 20,
            outputRows: 20,
            showStats
        });
    }

    /**
     * Template: Comparison Tool (Diff, Compare, etc.)
     */
    comparisonTool(config) {
        const {
            title,
            leftLabel = 'Input 1',
            rightLabel = 'Input 2',
            resultLabel = 'Comparison Result',
            compareAction = 'Compare',
            inputRows = 15
        } = config;

        const leftSection = {
            title: leftLabel,
            fields: [
                {
                    type: 'textarea',
                    id: `${this.getIdPrefix(title)}-input1`,
                    label: leftLabel,
                    placeholder: 'Enter first input...',
                    rows: inputRows,
                    monospace: true
                }
            ],
            buttons: [
                {
                    id: `validate-${this.getIdPrefix(title)}1-btn`,
                    text: 'Validate',
                    variant: 'accent',
                    fullWidth: true
                }
            ]
        };

        const rightSection = {
            title: rightLabel,
            fields: [
                {
                    type: 'textarea',
                    id: `${this.getIdPrefix(title)}-input2`,
                    label: rightLabel,
                    placeholder: 'Enter second input...',
                    rows: inputRows,
                    monospace: true
                }
            ],
            buttons: [
                {
                    id: `validate-${this.getIdPrefix(title)}2-btn`,
                    text: 'Validate',
                    variant: 'accent',
                    fullWidth: true
                }
            ]
        };

        const resultSection = {
            title: resultLabel,
            className: 'md:col-span-2',
            fields: [
                {
                    type: 'textarea',
                    id: `${this.getIdPrefix(title)}-result`,
                    label: resultLabel,
                    placeholder: 'Comparison result will appear here...',
                    rows: 10,
                    readonly: true,
                    monospace: true
                }
            ],
            buttons: [
                {
                    id: `${this.getIdPrefix(title)}-compare-btn`,
                    text: compareAction,
                    variant: 'primary'
                },
                {
                    id: `clear-${this.getIdPrefix(title)}-btn`,
                    text: 'Clear All',
                    variant: 'neutral'
                },
                {
                    id: `copy-${this.getIdPrefix(title)}-result-btn`,
                    text: 'Copy Result',
                    variant: 'neutral'
                }
            ]
        };

        return this.builder.buildToolUI({
            title,
            layout: 'two-column',
            sections: [leftSection, rightSection, resultSection]
        });
    }

    /**
     * Template: Form-based Tool (Generators, Converters, etc.)
     */
    formTool(config) {
        const {
            title,
            fields = [],
            actions = ['Generate'],
            showResult = true,
            resultLabel = 'Result'
        } = config;

        const formFields = fields.map(field => ({
            type: field.type || 'input',
            id: field.id,
            label: field.label,
            placeholder: field.placeholder || '',
            ...field
        }));

        const buttons = actions.map((action, index) => ({
            id: `${this.getIdPrefix(title)}-action${index}-btn`,
            text: action,
            variant: index === 0 ? 'primary' : 'secondary'
        }));

        const sections = [
            {
                title: 'Configuration',
                fields: formFields,
                buttons: [
                    ...buttons,
                    {
                        id: `clear-${this.getIdPrefix(title)}-btn`,
                        text: 'Clear All',
                        variant: 'neutral',
                        fullWidth: true
                    }
                ]
            }
        ];

        if (showResult) {
            sections.push({
                title: resultLabel,
                fields: [
                    {
                        type: 'textarea',
                        id: `${this.getIdPrefix(title)}-result`,
                        label: resultLabel,
                        placeholder: 'Generated result will appear here...',
                        rows: 10,
                        readonly: true,
                        monospace: true
                    }
                ],
                buttons: [
                    {
                        id: `copy-${this.getIdPrefix(title)}-result-btn`,
                        text: 'Copy Result',
                        variant: 'neutral',
                        fullWidth: true
                    }
                ]
            });
        }

        return this.builder.buildToolUI({
            title,
            layout: showResult ? 'two-column' : 'single-column',
            sections
        });
    }

    /**
     * Template: Live Tool (Real-time processing)
     */
    liveTool(config) {
        const {
            title,
            inputLabel = 'Input',
            outputLabel = 'Live Output',
            showClock = false,
            showStats = true
        } = config;

        const sections = [
            {
                title: inputLabel,
                fields: [
                    {
                        type: 'input',
                        id: `${this.getIdPrefix(title)}-input`,
                        label: inputLabel,
                        placeholder: 'Type to see live results...'
                    }
                ]
            },
            {
                title: outputLabel,
                fields: [
                    {
                        type: 'textarea',
                        id: `${this.getIdPrefix(title)}-output`,
                        label: outputLabel,
                        placeholder: 'Live results will appear here...',
                        rows: 8,
                        readonly: true
                    }
                ],
                buttons: [
                    {
                        id: `copy-${this.getIdPrefix(title)}-output-btn`,
                        text: 'Copy Output',
                        variant: 'neutral',
                        fullWidth: true
                    }
                ]
            }
        ];

        if (showClock) {
            sections.push({
                type: 'stats',
                className: 'md:col-span-2',
                items: [
                    { id: 'current-time', label: 'Current Time', value: new Date().toLocaleString(), color: 'blue' },
                    { id: 'timezone', label: 'Timezone', value: Intl.DateTimeFormat().resolvedOptions().timeZone, color: 'green' }
                ]
            });
        }

        if (showStats) {
            const statsItems = showClock ? [] : [
                { id: 'char-count', label: 'Characters', value: '0', color: 'blue' },
                { id: 'word-count', label: 'Words', value: '0', color: 'green' }
            ];

            if (statsItems.length > 0) {
                sections.push({
                    type: 'stats',
                    className: 'md:col-span-2',
                    items: statsItems
                });
            }
        }

        return this.builder.buildToolUI({
            title,
            layout: 'two-column',
            sections
        });
    }

    /**
     * Template: Multi-step Tool (Wizards, Workflows)
     */
    multiStepTool(config) {
        const { title, steps = [] } = config;

        let html = `<div class="max-w-6xl mx-auto">`;
        html += this.builder.createTitle(title);

        // Step indicators
        html += `<div class="mb-8">`;
        html += `<nav aria-label="Progress">`;
        html += `<ol class="flex items-center">`;
        steps.forEach((step, index) => {
            const isLast = index === steps.length - 1;
            html += `
                <li class="relative ${!isLast ? 'flex-1' : ''}">
                    <div class="flex items-center">
                        <div class="relative flex items-center justify-center w-8 h-8 bg-gray-700 border-2 border-gray-600 rounded-full step-indicator" data-step="${index}">
                            <span class="text-sm font-medium text-gray-300">${index + 1}</span>
                        </div>
                        <div class="ml-4 min-w-0">
                            <p class="text-sm font-medium text-gray-300">${step.title}</p>
                        </div>
                    </div>
                    ${!isLast ? '<div class="absolute top-4 left-8 w-full h-0.5 bg-gray-600"></div>' : ''}
                </li>
            `;
        });
        html += `</ol>`;
        html += `</nav>`;
        html += `</div>`;

        // Step content
        html += `<div class="step-content">`;
        steps.forEach((step, index) => {
            html += `<div class="step-panel ${index === 0 ? '' : 'hidden'}" data-step="${index}">`;
            html += this.builder.buildSection(step);
            html += `</div>`;
        });
        html += `</div>`;

        // Navigation buttons
        html += `<div class="mt-8 flex justify-between">`;
        html += this.builder.createButton({
            id: 'prev-step-btn',
            text: 'Previous',
            variant: 'neutral',
            className: 'hidden'
        });
        html += this.builder.createButton({
            id: 'next-step-btn', 
            text: 'Next',
            variant: 'primary'
        });
        html += `</div>`;

        html += this.builder.createMessage({ id: 'message', hidden: true });
        html += `</div>`;

        return html;
    }

    /**
     * Utility: Get ID prefix from title
     */
    getIdPrefix(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    /**
     * Quick generate method - automatically detect tool type and generate appropriate template
     */
    autoGenerate(config) {
        const { type, ...otherConfig } = config;

        switch (type) {
            case 'text-processing':
            case 'encoder':
            case 'decoder':
                return this.textProcessingTool(otherConfig);
            
            case 'json':
            case 'json-tool':
                return this.jsonProcessingTool(otherConfig);
            
            case 'comparison':
            case 'diff':
                return this.comparisonTool(otherConfig);
            
            case 'form':
            case 'generator':
                return this.formTool(otherConfig);
            
            case 'live':
            case 'realtime':
                return this.liveTool(otherConfig);
            
            case 'multi-step':
            case 'wizard':
                return this.multiStepTool(otherConfig);
            
            default:
                return this.textProcessingTool(otherConfig);
        }
    }
}

// Export for global use
window.UITemplates = UITemplates;