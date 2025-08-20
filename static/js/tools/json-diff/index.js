/**
 * JSON Diff Tool
 * Standalone module for comparing JSON objects
 */

export default class JSONDiffTool extends BaseTool {
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
                { id: 'validate-json1-btn', action: 'validateJSON1' },
                { id: 'validate-json2-btn', action: 'validateJSON2' },
                { id: 'clear-json1-btn', action: 'clearJSON1' },
                { id: 'clear-json2-btn', action: 'clearJSON2' },
                { id: 'clear-diff-btn', action: 'clearDiff' },
                { id: 'copy-diff-output-btn', action: 'copyDiffOutput' }
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
                
                // Show diff statistics
                this.showDiffStats(result.data);
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
            const parsed = JSON.parse(input);
            ui.showMessage(`✓ ${fieldName} is valid`, 'success');
            return { valid: true, data: parsed };
        } catch (error) {
            ui.showMessage(`✗ ${fieldName} is invalid: ${error.message}`, 'error');
            return { valid: false, error: error.message };
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
        this.hideDiffStats();
    }

    copyDiffOutput() {
        const output = ui.getElement('diff-output');
        const text = output.textContent;
        
        if (text && text !== 'Diff result will appear here...') {
            ui.copyToClipboard(text);
            ui.showMessage('Diff copied to clipboard', 'success');
        } else {
            ui.showMessage('Nothing to copy', 'error');
        }
    }

    // Tool-specific utilities
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

    showDiffStats(diffText) {
        const lines = diffText.split('\n');
        const additions = lines.filter(line => line.startsWith('+')).length;
        const deletions = lines.filter(line => line.startsWith('-')).length;
        
        const statsElement = ui.getElement('diff-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="flex space-x-4 text-sm text-gray-400">
                    <span class="text-green-400">+${additions} additions</span>
                    <span class="text-red-400">-${deletions} deletions</span>
                </div>
            `;
            statsElement.classList.remove('hidden');
        }
    }

    hideDiffStats() {
        const statsElement = ui.getElement('diff-stats');
        if (statsElement) {
            statsElement.classList.add('hidden');
        }
    }

    // Advanced diff features
    generatePatchFile() {
        const diffOutput = ui.getValue('diff-output');
        if (!diffOutput || diffOutput === 'Diff result will appear here...') {
            ui.showMessage('No diff to export', 'warning');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `json-diff-${timestamp}.patch`;
        
        CToolsUtils.downloadAsFile(diffOutput, filename, 'text/plain');
        ui.showMessage(`Patch file exported as ${filename}`, 'success');
    }

    deepCompare(obj1, obj2) {
        // Custom deep comparison logic
        const changes = [];
        
        const compare = (a, b, path = '') => {
            if (a === b) return;
            
            if (typeof a !== typeof b) {
                changes.push({ path, type: 'type-change', from: typeof a, to: typeof b });
                return;
            }
            
            if (a === null || b === null) {
                changes.push({ path, type: 'value-change', from: a, to: b });
                return;
            }
            
            if (Array.isArray(a) && Array.isArray(b)) {
                const maxLen = Math.max(a.length, b.length);
                for (let i = 0; i < maxLen; i++) {
                    const newPath = `${path}[${i}]`;
                    if (i >= a.length) {
                        changes.push({ path: newPath, type: 'addition', value: b[i] });
                    } else if (i >= b.length) {
                        changes.push({ path: newPath, type: 'deletion', value: a[i] });
                    } else {
                        compare(a[i], b[i], newPath);
                    }
                }
                return;
            }
            
            if (typeof a === 'object' && typeof b === 'object') {
                const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
                for (const key of allKeys) {
                    const newPath = path ? `${path}.${key}` : key;
                    if (!(key in a)) {
                        changes.push({ path: newPath, type: 'addition', value: b[key] });
                    } else if (!(key in b)) {
                        changes.push({ path: newPath, type: 'deletion', value: a[key] });
                    } else {
                        compare(a[key], b[key], newPath);
                    }
                }
                return;
            }
            
            changes.push({ path, type: 'value-change', from: a, to: b });
        };
        
        compare(obj1, obj2);
        return changes;
    }
}