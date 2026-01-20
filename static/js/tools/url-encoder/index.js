/**
 * URL Encoder/Decoder Tool - Example of UI Framework Usage
 * Demonstrates how to build UIs rapidly with the CTools UI Framework
 */

export default class URLEncoderTool extends BaseTool {
    constructor() {
        super({
            name: 'URL Encoder/Decoder',
            inputFields: [
                { id: 'url-encoder-decoder-input', name: 'URL Input', required: true }
            ],
            outputFields: [
                { id: 'url-encoder-decoder-output', copyable: true }
            ],
            buttons: [
                { id: 'url-encoder-decoder-btn', action: 'encodeURL' },
                { id: 'url-encoder-decoder-secondary-btn', action: 'decodeURL' },
                { id: 'clear-url-encoder-decoder-btn', action: 'clearAll' },
                { id: 'copy-url-encoder-decoder-btn', action: 'copyOutput' }
            ],
            validateInputs: false
        });
    }

    init() {
        super.init();
        
        // Setup character counters for the input
        uiUtils.setupCounters('url-encoder-decoder-input', {
            charCountId: 'char-count',
            bytesId: 'size-bytes'
        });
        
        // Enable auto-resize for textareas
        uiUtils.enableAutoResize('url-encoder-decoder-input');
        uiUtils.enableAutoResize('url-encoder-decoder-output');
    }

    async encodeURL() {
        const input = ui.getValue('url-encoder-decoder-input');
        if (!input) {
            uiUtils.showMessage('Please enter a URL to encode', 'error');
            return;
        }

        uiUtils.updateButtonState('url-encoder-decoder-btn', { loading: true });
        
        try {
            const encoded = encodeURIComponent(input);
            ui.setValue('url-encoder-decoder-output', encoded);
            
            // Update stats
            uiUtils.updateStats({
                'char-count': encoded.length.toLocaleString(),
                'size-bytes': new Blob([encoded]).size.toLocaleString()
            });
            
            uiUtils.showMessage('URL encoded successfully!', 'success');
        } catch (error) {
            uiUtils.showMessage(`Encoding error: ${error.message}`, 'error');
        } finally {
            uiUtils.updateButtonState('url-encoder-decoder-btn', { loading: false });
        }
    }

    async decodeURL() {
        const input = ui.getValue('url-encoder-decoder-input');
        if (!input) {
            uiUtils.showMessage('Please enter a URL to decode', 'error');
            return;
        }

        uiUtils.updateButtonState('url-encoder-decoder-secondary-btn', { loading: true });
        
        try {
            const decoded = decodeURIComponent(input);
            ui.setValue('url-encoder-decoder-output', decoded);
            
            // Update stats
            uiUtils.updateStats({
                'char-count': decoded.length.toLocaleString(),
                'size-bytes': new Blob([decoded]).size.toLocaleString()
            });
            
            uiUtils.showMessage('URL decoded successfully!', 'success');
        } catch (error) {
            uiUtils.showMessage(`Decoding error: ${error.message}`, 'error');
        } finally {
            uiUtils.updateButtonState('url-encoder-decoder-secondary-btn', { loading: false });
        }
    }

    clearAll() {
        this.clearFields();
        uiUtils.updateStats({
            'char-count': '0',
            'size-bytes': '0'
        });
        uiUtils.showMessage('Cleared all fields', 'info', 2000);
    }

    async copyOutput() {
        const output = ui.getValue('url-encoder-decoder-output');
        if (!output) {
            uiUtils.showMessage('No output to copy', 'warning');
            return;
        }
        
        await uiUtils.copyToClipboard(output, 'copy-url-encoder-decoder-btn');
    }
}