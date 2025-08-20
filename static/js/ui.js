/**
 * Shared UI utilities for CTools
 * Handles common UI operations and messaging
 */
class UIManager {
    constructor() {
        this.messageTimeout = null;
    }

    /**
     * Get element by ID with error handling
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element not found: ${id}`);
            return null;
        }
        return element;
    }

    /**
     * Get element value safely
     */
    getValue(id) {
        const element = this.getElement(id);
        return element ? element.value.trim() : '';
    }

    /**
     * Set element value safely
     */
    setValue(id, value) {
        const element = this.getElement(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * Clear element value
     */
    clearValue(id) {
        this.setValue(id, '');
    }

    /**
     * Show message with auto-hide
     */
    showMessage(message, type = 'success', duration = 3000) {
        const messageDiv = this.getElement('message');
        if (!messageDiv) return;

        // Clear existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        // Set message styling based on type
        const styles = {
            success: 'bg-green-900 text-green-100 border border-green-700',
            error: 'bg-red-900 text-red-100 border border-red-700',
            warning: 'bg-yellow-900 text-yellow-100 border border-yellow-700',
            info: 'bg-blue-900 text-blue-100 border border-blue-700'
        };

        messageDiv.className = `mt-4 p-4 rounded-md ${styles[type] || styles.success}`;
        messageDiv.textContent = message;
        messageDiv.classList.remove('hidden');

        // Auto-hide after duration
        this.messageTimeout = setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, duration);
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('Copied to clipboard', 'success');
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            this.showMessage('Failed to copy to clipboard', 'error');
            return false;
        }
    }

    /**
     * Copy element value to clipboard
     */
    async copyElementValue(id) {
        const value = this.getValue(id);
        if (!value) {
            this.showMessage('Nothing to copy', 'warning');
            return false;
        }
        return this.copyToClipboard(value);
    }

    /**
     * Validate required fields
     */
    validateRequired(fields) {
        const missing = [];
        
        for (const field of fields) {
            const value = this.getValue(field.id);
            if (!value) {
                missing.push(field.name || field.id);
            }
        }

        if (missing.length > 0) {
            this.showMessage(`Please fill in: ${missing.join(', ')}`, 'error');
            return false;
        }

        return true;
    }

    /**
     * Show loading state on button
     */
    setButtonLoading(buttonId, loading = true, originalText = null) {
        const button = this.getElement(buttonId);
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            `;
        } else {
            button.disabled = false;
            button.textContent = originalText || button.dataset.originalText || 'Submit';
        }
    }

    /**
     * Update statistics (for JSON beautifier)
     */
    updateStats(text) {
        this.setValue('char-count', text.length.toString());
        this.setValue('line-count', text ? text.split('\n').length.toString() : '0');
        this.setValue('size-bytes', new Blob([text]).size.toString());
    }

    /**
     * Initialize tooltips and other UI enhancements
     */
    initializeEnhancements() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter or Cmd+Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const submitButton = document.querySelector('button[onclick*="()"]');
                if (submitButton) {
                    submitButton.click();
                    e.preventDefault();
                }
            }
        });

        // Auto-resize textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
        });
    }
}

// Global UI manager instance
const ui = new UIManager();