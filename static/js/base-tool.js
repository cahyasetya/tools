/**
 * Base Tool class - provides common functionality for all tools
 */
class BaseTool {
    constructor(config = {}) {
        this.config = {
            name: 'Unknown Tool',
            inputFields: [],
            outputFields: [],
            buttons: [],
            ...config
        };
        
        this.isProcessing = false;
    }

    /**
     * Initialize the tool
     */
    init() {
        this.bindEvents();
        this.initializeUI();
        ui.initializeEnhancements();
    }

    /**
     * Rebind events (useful for dynamically generated UIs)
     */
    rebindEvents() {
        this.bindEvents();
        ui.initializeEnhancements();
    }

    /**
     * Bind button events
     */
    bindEvents() {
        this.config.buttons.forEach(button => {
            const element = ui.getElement(button.id);
            if (element && button.action) {
                element.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await this.executeAction(button.action, button.id);
                });
            }
        });
    }

    /**
     * Execute tool action
     */
    async executeAction(actionName, buttonId) {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            ui.setButtonLoading(buttonId, true);

            // Validate inputs if required
            if (this.config.validateInputs) {
                const isValid = this.validateInputs();
                if (!isValid) return;
            }

            // Execute the action
            if (typeof this[actionName] === 'function') {
                await this[actionName]();
            } else {
                throw new Error(`Action '${actionName}' not found`);
            }
        } catch (error) {
            console.error(`Error in ${actionName}:`, error);
            ui.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
            ui.setButtonLoading(buttonId, false);
        }
    }

    /**
     * Validate input fields
     */
    validateInputs() {
        const requiredFields = this.config.inputFields.filter(field => field.required);
        return ui.validateRequired(requiredFields);
    }

    /**
     * Get input values as object
     */
    getInputs() {
        const inputs = {};
        this.config.inputFields.forEach(field => {
            inputs[field.name || field.id] = ui.getValue(field.id);
        });
        return inputs;
    }

    /**
     * Set output values
     */
    setOutput(fieldId, value) {
        ui.setValue(fieldId, value);
    }

    /**
     * Clear all fields
     */
    clearFields() {
        [...this.config.inputFields, ...this.config.outputFields].forEach(field => {
            ui.clearValue(field.id);
        });
    }

    /**
     * Copy output to clipboard
     */
    async copyOutput(fieldId) {
        return ui.copyElementValue(fieldId);
    }

    /**
     * Initialize UI enhancements
     */
    initializeUI() {
        // Add copy buttons to output fields
        this.config.outputFields.forEach(field => {
            if (field.copyable) {
                this.addCopyButton(field.id);
            }
        });
    }

    /**
     * Add copy button to field
     */
    addCopyButton(fieldId) {
        const field = ui.getElement(fieldId);
        if (!field) return;

        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.className = 'ml-2 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded';
        copyBtn.addEventListener('click', () => this.copyOutput(fieldId));
        
        field.parentNode.appendChild(copyBtn);
    }
}

// Export for use in other files
window.BaseTool = BaseTool;