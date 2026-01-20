/**
 * UUID Generator Tool - Built with CTools UI Framework
 * Generates various types of UUIDs with customizable options
 */

export default class UUIDGeneratorTool extends BaseTool {
    constructor() {
        super({
            name: 'UUID Generator',
            inputFields: [
                { id: 'uuid-count', name: 'Count', required: false },
                { id: 'uuid-version', name: 'Version', required: false },
                { id: 'uppercase-option', name: 'Uppercase', required: false },
                { id: 'include-hyphens', name: 'Hyphens', required: false }
            ],
            outputFields: [
                { id: 'uuid-result', copyable: true }
            ],
            buttons: [
                { id: 'generate-uuid-btn', action: 'generateUUIDs' },
                { id: 'generate-bulk-btn', action: 'generateBulk' },
                { id: 'clear-uuid-btn', action: 'clearAll' },
                { id: 'copy-uuid-result-btn', action: 'copyResult' }
            ],
            validateInputs: false
        });
    }

    init() {
        super.init();
        
        // Setup auto-resize for result textarea
        uiUtils.enableAutoResize('uuid-result');
        
        // Setup stats counters
        uiUtils.setupCounters('uuid-result', {
            charCountId: 'char-count',
            lineCountId: 'line-count',
            bytesId: 'size-bytes'
        });

        // Generate one UUID by default
        setTimeout(() => this.generateUUIDs(), 100);
    }

    /**
     * Generate UUID v4 (random)
     */
    generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generate UUID v1 (timestamp-based) - simplified version
     */
    generateUUIDv1() {
        const timestamp = new Date().getTime();
        const timestampHex = timestamp.toString(16).padStart(12, '0');
        const randomHex = Math.random().toString(16).substring(2, 14).padStart(12, '0');
        
        return [
            timestampHex.substring(0, 8),
            timestampHex.substring(8, 12),
            '1' + randomHex.substring(0, 3),
            '8' + randomHex.substring(3, 6),
            randomHex.substring(6, 18)
        ].join('-');
    }

    /**
     * Generate NIL UUID
     */
    generateNilUUID() {
        return '00000000-0000-0000-0000-000000000000';
    }

    /**
     * Format UUID according to options
     */
    formatUUID(uuid, options = {}) {
        const { uppercase = false, hyphens = true } = options;
        
        let formatted = uuid;
        
        if (!hyphens) {
            formatted = formatted.replace(/-/g, '');
        }
        
        if (uppercase) {
            formatted = formatted.toUpperCase();
        }
        
        return formatted;
    }

    /**
     * Generate UUIDs based on current settings
     */
    async generateUUIDs() {
        uiUtils.updateButtonState('generate-uuid-btn', { loading: true });
        
        try {
            const count = parseInt(ui.getValue('uuid-count') || '1');
            const version = ui.getValue('uuid-version') || 'v4';
            const uppercase = document.getElementById('uppercase-option')?.checked || false;
            const hyphens = document.getElementById('include-hyphens')?.checked !== false; // default true
            
            const uuids = [];
            
            for (let i = 0; i < Math.min(count, 1000); i++) { // Limit to 1000 for performance
                let uuid;
                
                switch (version) {
                    case 'v1':
                        uuid = this.generateUUIDv1();
                        break;
                    case 'v4':
                        uuid = this.generateUUIDv4();
                        break;
                    case 'nil':
                        uuid = this.generateNilUUID();
                        break;
                    default:
                        uuid = this.generateUUIDv4();
                }
                
                uuids.push(this.formatUUID(uuid, { uppercase, hyphens }));
            }
            
            const result = uuids.join('\n');
            ui.setValue('uuid-result', result);
            
            // Update stats
            uiUtils.updateStats({
                'uuid-count-stat': count.toLocaleString(),
                'version-stat': version.toUpperCase(),
                'format-stat': `${uppercase ? 'UPPER' : 'lower'}${hyphens ? '' : ', no hyphens'}`
            });
            
            uiUtils.showMessage(`Generated ${count} UUID${count > 1 ? 's' : ''} successfully!`, 'success', 3000);
            
        } catch (error) {
            uiUtils.showMessage(`Generation error: ${error.message}`, 'error');
        } finally {
            uiUtils.updateButtonState('generate-uuid-btn', { loading: false });
        }
    }

    /**
     * Generate bulk UUIDs (quick presets)
     */
    async generateBulk() {
        // Set bulk generation options
        ui.setValue('uuid-count', '10');
        ui.setValue('uuid-version', 'v4');
        
        // Trigger generation
        await this.generateUUIDs();
    }

    /**
     * Clear all fields
     */
    clearAll() {
        this.clearFields();
        
        // Reset form fields
        ui.setValue('uuid-count', '1');
        ui.setValue('uuid-version', 'v4');
        
        const uppercaseCheck = document.getElementById('uppercase-option');
        const hyphensCheck = document.getElementById('include-hyphens');
        
        if (uppercaseCheck) uppercaseCheck.checked = false;
        if (hyphensCheck) hyphensCheck.checked = true;
        
        uiUtils.updateStats({
            'uuid-count-stat': '0',
            'version-stat': 'V4',
            'format-stat': 'lower'
        });
        
        uiUtils.showMessage('Cleared all fields', 'info', 2000);
    }

    /**
     * Copy result to clipboard
     */
    async copyResult() {
        const result = ui.getValue('uuid-result');
        if (!result) {
            uiUtils.showMessage('No UUIDs to copy', 'warning');
            return;
        }
        
        await uiUtils.copyToClipboard(result, 'copy-uuid-result-btn');
    }

    /**
     * Validate UUID format
     */
    validateUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Get UUID info (version, variant, etc.)
     */
    getUUIDInfo(uuid) {
        if (!this.validateUUID(uuid)) {
            return { valid: false };
        }

        const parts = uuid.split('-');
        const version = parseInt(parts[2].charAt(0), 16);
        const variant = parseInt(parts[3].charAt(0), 16);
        
        let variantName = 'Unknown';
        if ((variant & 0x8) === 0x8) {
            variantName = 'RFC 4122';
        } else if ((variant & 0x4) === 0x4) {
            variantName = 'Microsoft';
        } else if ((variant & 0x2) === 0x2) {
            variantName = 'Reserved (NCS)';
        }

        return {
            valid: true,
            version,
            variant: variantName,
            timestamp: version === 1 ? new Date(parseInt(parts[0] + parts[1], 16)).toISOString() : null
        };
    }
}