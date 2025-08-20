/**
 * Base64 Encoder/Decoder Tool
 * Standalone module for Base64 operations
 */

export default class Base64Tool extends BaseTool {
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
                { id: 'decode-btn', action: 'decodeText' },
                { id: 'copy-encode-output-btn', action: 'copyEncodeOutput' },
                { id: 'copy-decode-output-btn', action: 'copyDecodeOutput' }
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

    copyEncodeOutput() {
        ui.copyElementValue('encode-output');
    }

    copyDecodeOutput() {
        ui.copyElementValue('decode-output');
    }

    // Tool-specific utilities
    isValidBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    // Extended functionality
    encodeFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}