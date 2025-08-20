/**
 * JSON Beautifier Tool
 * Standalone module for JSON formatting and validation
 */

export default class JSONBeautifyTool extends BaseTool {
    constructor() {
        super({
            name: 'JSON Beautifier',
            inputFields: [
                { id: 'json-input', name: 'JSON Input', required: true }
            ],
            outputFields: [
                { id: 'json-output', copyable: true }
            ],
            buttons: [
                { id: 'beautify-btn', action: 'beautifyJSON' },
                { id: 'minify-btn', action: 'minifyJSON' },
                { id: 'validate-btn', action: 'validateJSON' },
                { id: 'clear-btn', action: 'clearAll' }
            ],
            validateInputs: false
        });
    }

    init() {
        super.init();
        // Update stats on input change
        const inputField = ui.getElement('json-input');
        if (inputField) {
            inputField.addEventListener('input', () => {
                ui.updateStats(inputField.value);
            });
        }
    }

    async beautifyJSON() {
        const input = ui.getValue('json-input');
        if (!input) {
            ui.showMessage('Please enter JSON to beautify', 'error');
            return;
        }

        const result = await api.beautifyJSON(input);
        
        if (result.success) {
            ui.setValue('json-output', result.data);
            ui.updateStats(result.data);
            ui.showMessage('JSON beautified successfully', 'success');
            this.highlightSyntax();
        } else {
            ui.showMessage(`Invalid JSON: ${result.error}`, 'error');
        }
    }

    async minifyJSON() {
        const input = ui.getValue('json-input');
        if (!input) {
            ui.showMessage('Please enter JSON to minify', 'error');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            ui.setValue('json-output', minified);
            ui.updateStats(minified);
            ui.showMessage('JSON minified successfully', 'success');
        } catch (error) {
            ui.showMessage(`Invalid JSON: ${error.message}`, 'error');
        }
    }

    async validateJSON() {
        const input = ui.getValue('json-input');
        if (!input) {
            ui.showMessage('Please enter JSON to validate', 'error');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            ui.showMessage('✓ Valid JSON', 'success');
            return { valid: true, data: parsed };
        } catch (error) {
            ui.showMessage(`✗ Invalid JSON: ${error.message}`, 'error');
            return { valid: false, error: error.message };
        }
    }

    clearAll() {
        this.clearFields();
        ui.updateStats('');
    }

    // Tool-specific utilities
    highlightSyntax() {
        const outputField = ui.getElement('json-output');
        if (!outputField) return;

        // Basic syntax highlighting (can be enhanced with a library)
        const json = outputField.value;
        const highlighted = json
            .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
            .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
            .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>')
            .replace(/: (\d+)/g, ': <span class="text-yellow-400">$1</span>');
        
        // Note: This is a basic example. For full highlighting, use a library like Prism.js
    }

    getJSONSchema(obj) {
        // Generate basic JSON schema
        const getType = (val) => {
            if (val === null) return 'null';
            if (Array.isArray(val)) return 'array';
            return typeof val;
        };

        const generateSchema = (obj) => {
            const schema = { type: getType(obj) };
            
            if (schema.type === 'object' && obj !== null) {
                schema.properties = {};
                for (const [key, value] of Object.entries(obj)) {
                    schema.properties[key] = generateSchema(value);
                }
            } else if (schema.type === 'array') {
                schema.items = obj.length > 0 ? generateSchema(obj[0]) : { type: 'string' };
            }
            
            return schema;
        };

        return generateSchema(obj);
    }

    exportJSON(format = 'json') {
        const output = ui.getValue('json-output');
        if (!output) {
            ui.showMessage('No JSON to export', 'warning');
            return;
        }

        const filename = `beautified.${format}`;
        CToolsUtils.downloadAsFile(output, filename, 'application/json');
        ui.showMessage(`Exported as ${filename}`, 'success');
    }
}