/**
 * Specific tool implementations extending BaseTool
 */

/**
 * Base64 Encoder/Decoder Tool
 */
class Base64Tool extends BaseTool {
    constructor() {
        super({
            name: 'Base64 Encoder/Decoder',
            inputFields: [
                { id: 'encode-input', name: 'Text to Encode', required: false },
                { id: 'decode-input', name: 'Base64 to Decode', required: false }
            ],
            outputFields: [
                { id: 'encode-output', copyable: true },
                { id: 'decode-output', copyable: true }
            ],
            buttons: [
                { id: 'encode-btn', action: 'encodeText' },
                { id: 'decode-btn', action: 'decodeText' }
            ]
        });
    }

    async encodeText() {
        const input = ui.getValue('encode-input');
        if (!input) {
            ui.showMessage('Please enter text to encode', 'error');
            return;
        }

        const result = await api.encodeBase64(input);
        
        if (result.success) {
            ui.setValue('encode-output', result.data);
            ui.showMessage('Text encoded successfully', 'success');
        } else {
            ui.showMessage(result.error, 'error');
        }
    }

    async decodeText() {
        const input = ui.getValue('decode-input');
        if (!input) {
            ui.showMessage('Please enter Base64 to decode', 'error');
            return;
        }

        const result = await api.decodeBase64(input);
        
        if (result.success) {
            ui.setValue('decode-output', result.data);
            ui.showMessage('Base64 decoded successfully', 'success');
        } else {
            ui.showMessage(result.error, 'error');
        }
    }
}

/**
 * JSON Beautifier Tool
 */
class JSONBeautifyTool extends BaseTool {
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
            validateInputs: false // We'll handle validation manually
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
            JSON.parse(input);
            ui.showMessage('✓ Valid JSON', 'success');
        } catch (error) {
            ui.showMessage(`✗ Invalid JSON: ${error.message}`, 'error');
        }
    }

    clearAll() {
        this.clearFields();
        ui.updateStats('');
    }
}

/**
 * JSON Diff Tool
 */
class JSONDiffTool extends BaseTool {
    constructor() {
        super({
            name: 'JSON Diff Tool',
            inputFields: [
                { id: 'json1-input', name: 'JSON 1', required: true },
                { id: 'json2-input', name: 'JSON 2', required: true }
            ],
            outputFields: [
                { id: 'diff-output', copyable: true }
            ],
            buttons: [
                { id: 'compare-btn', action: 'compareJSON' },
                { id: 'validate1-btn', action: 'validateJSON1' },
                { id: 'validate2-btn', action: 'validateJSON2' },
                { id: 'clear1-btn', action: 'clearJSON1' },
                { id: 'clear2-btn', action: 'clearJSON2' },
                { id: 'clear-diff-btn', action: 'clearDiff' }
            ]
        });
    }

    async compareJSON() {
        const json1 = ui.getValue('json1-input');
        const json2 = ui.getValue('json2-input');
        
        if (!json1 || !json2) {
            ui.showMessage('Please enter both JSON inputs to compare', 'error');
            return;
        }

        // Validate both JSONs first
        try {
            JSON.parse(json1);
            JSON.parse(json2);
        } catch (error) {
            ui.showMessage(`One or both JSON inputs are invalid: ${error.message}`, 'error');
            return;
        }

        const result = await api.diffJSON(json1, json2);
        
        if (result.success) {
            const output = ui.getElement('diff-output');
            if (result.data.trim() === '') {
                output.textContent = 'No differences found - JSONs are identical!';
                output.className = output.className + ' text-green-400';
                ui.showMessage('JSONs are identical', 'success');
            } else {
                output.innerHTML = this.colorCodeDiff(result.data);
                output.className = output.className.replace(' text-green-400', '');
                ui.showMessage('JSON comparison completed', 'success');
            }
        } else {
            ui.showMessage(`Error comparing JSONs: ${result.error}`, 'error');
        }
    }

    validateJSON1() {
        this.validateJSONField('json1-input', 'JSON 1');
    }

    validateJSON2() {
        this.validateJSONField('json2-input', 'JSON 2');
    }

    validateJSONField(fieldId, fieldName) {
        const input = ui.getValue(fieldId);
        if (!input) {
            ui.showMessage(`Please enter ${fieldName} to validate`, 'error');
            return;
        }

        try {
            JSON.parse(input);
            ui.showMessage(`✓ ${fieldName} is valid`, 'success');
        } catch (error) {
            ui.showMessage(`✗ ${fieldName} is invalid: ${error.message}`, 'error');
        }
    }

    clearJSON1() {
        ui.clearValue('json1-input');
    }

    clearJSON2() {
        ui.clearValue('json2-input');
    }

    clearDiff() {
        const output = ui.getElement('diff-output');
        if (output) {
            output.textContent = 'Diff result will appear here...';
            output.className = output.className.replace(' text-green-400', '');
        }
    }

    colorCodeDiff(diffText) {
        const lines = diffText.split('\n');
        return lines.map(line => {
            if (line.startsWith('+++') || line.startsWith('---')) {
                return `<span class="font-bold text-gray-300">${this.escapeHtml(line)}</span>`;
            } else if (line.startsWith('+')) {
                return `<span class="text-green-400 bg-green-900/20">${this.escapeHtml(line)}</span>`;
            } else if (line.startsWith('-')) {
                return `<span class="text-red-400 bg-red-900/20">${this.escapeHtml(line)}</span>`;
            } else if (line.startsWith('@@')) {
                return `<span class="text-blue-400 font-semibold">${this.escapeHtml(line)}</span>`;
            } else {
                return this.escapeHtml(line);
            }
        }).join('\n');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make classes available globally
window.Base64Tool = Base64Tool;
window.JSONBeautifyTool = JSONBeautifyTool;
window.JSONDiffTool = JSONDiffTool;