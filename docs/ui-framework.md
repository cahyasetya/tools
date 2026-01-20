# CTools UI Framework

A powerful, declarative UI framework that makes building consistent developer tool interfaces incredibly fast and easy.

## Overview

The CTools UI Framework provides a set of components and templates that make it easy to build beautiful, functional developer tools without writing repetitive HTML/CSS. It's built on top of Tailwind CSS and integrates seamlessly with the CTools architecture.

## Benefits

- **⚡ 10x Faster Development** - Generate complete UIs with a few lines
- **🎨 Consistent Design** - All tools look and feel the same
- **📱 Responsive** - Works perfectly on desktop, tablet, and mobile
- **♿ Accessible** - Built-in accessibility features
- **🔧 Maintainable** - Centralized styling and behavior
- **🚀 Powerful** - Rich feature set with minimal code

## Quick Start

### 1. Basic Usage

```javascript
// Create a simple text processing tool
const html = uiTemplates.textProcessingTool({
    title: 'My Awesome Tool',
    inputLabel: 'Input Text',
    outputLabel: 'Processed Output',
    primaryAction: 'Process',
    secondaryAction: 'Transform'
});

document.getElementById('container').innerHTML = html;
```

### 2. Component Building

```javascript
// Build custom components
const html = uiBuilder.buildToolUI({
    title: 'Custom Tool',
    layout: 'two-column',
    sections: [
        {
            title: 'Configuration',
            fields: [
                {
                    type: 'input',
                    id: 'my-input',
                    label: 'Enter Value',
                    placeholder: 'Type here...'
                }
            ],
            buttons: [
                {
                    id: 'process-btn',
                    text: 'Process',
                    variant: 'primary'
                }
            ]
        }
    ]
});
```

## Core Components

### 1. UIBuilder (`ui-builder.js`)

The core component builder that creates individual UI elements.

```javascript
// Create a button
const button = uiBuilder.createButton({
    id: 'my-button',
    text: 'Click Me',
    variant: 'primary',
    fullWidth: true
});

// Create an input field
const input = uiBuilder.createInput({
    id: 'my-input',
    label: 'Enter text',
    placeholder: 'Type here...',
    required: true
});

// Create a textarea
const textarea = uiBuilder.createTextarea({
    id: 'my-textarea',
    label: 'Long text',
    rows: 10,
    monospace: true,
    readonly: false
});
```

### 2. UITemplates (`ui-templates.js`)

Pre-built templates for common tool patterns.

```javascript
// Text processing tool (Base64, URL Encoder, etc.)
const html = uiTemplates.textProcessingTool({
    title: 'My Text Tool',
    inputLabel: 'Input Text',
    outputLabel: 'Output Text',
    primaryAction: 'Process',
    secondaryAction: 'Reverse',
    showStats: true
});

// JSON processing tool
const jsonHtml = uiTemplates.jsonProcessingTool({
    title: 'JSON Formatter',
    actions: ['Beautify', 'Minify', 'Validate']
});

// Form-based tool (generators, etc.)
const formHtml = uiTemplates.formTool({
    title: 'UUID Generator',
    fields: [
        { id: 'count', label: 'Count', type: 'input' },
        { id: 'version', label: 'Version', type: 'select' }
    ],
    actions: ['Generate']
});
```

### 3. UIUtils (`ui-utils.js`)

Utilities for common UI operations and enhanced functionality.

#### Messages

```javascript
// Show success message
uiUtils.showMessage('Operation completed!', 'success');

// Show error with custom duration
uiUtils.showMessage('Something went wrong', 'error', 10000);

// Message types: success, error, warning, info
```

#### Button States

```javascript
// Show loading state
uiUtils.updateButtonState('my-btn', { loading: true });

// Update text and variant
uiUtils.updateButtonState('my-btn', {
    text: 'Updated!',
    variant: 'success'
});

// Reset to normal state
uiUtils.updateButtonState('my-btn', { loading: false, disabled: false });
```

#### Copy to Clipboard

```javascript
// Copy with button feedback
await uiUtils.copyToClipboard('Hello World', 'copy-btn');

// Simple copy without button reference
await uiUtils.copyToClipboard(text);
```

#### Stats Updates

```javascript
// Update multiple stats at once
uiUtils.updateStats({
    'char-count': '1,234',
    'word-count': '567',
    'size-bytes': '2.1KB'
});
```

#### Auto Features

```javascript
// Auto-resize textareas
uiUtils.enableAutoResize('my-textarea');

// Auto character/word/line counters
uiUtils.setupCounters('my-input', {
    charCountId: 'char-count',
    wordCountId: 'word-count',
    lineCountId: 'line-count',
    bytesId: 'size-bytes'
});

// Theme switching
uiUtils.switchTheme('dark');  // or 'light' - saved to localStorage
```

#### Form Validation

```javascript
const result = uiUtils.validateForm('my-form', {
    'email-field': {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email'
    },
    'password-field': {
        required: true,
        minLength: 8,
        validate: (value) => /[A-Z]/.test(value),
        validateMessage: 'Password must contain uppercase letter'
    }
});

if (result.isValid) {
    // Process form
} else {
    console.log(result.errors);
}
```

## Templates

### Text Processing Tool

Perfect for tools that transform text input to output (encoders, formatters, etc.).

```javascript
const html = uiTemplates.textProcessingTool({
    title: 'Base64 Encoder',
    inputLabel: 'Plain Text',
    outputLabel: 'Base64 Encoded',
    inputPlaceholder: 'Enter text to encode...',
    outputPlaceholder: 'Encoded text will appear here...',
    primaryAction: 'Encode',
    secondaryAction: 'Decode',
    showStats: true,
    inputRows: 6,
    outputRows: 6,
    monospace: true
});
```

**Generated Elements:**
- Input textarea with ID: `{tool-id}-input`
- Output textarea with ID: `{tool-id}-output`
- Primary button with ID: `{tool-id}-btn`
- Secondary button with ID: `{tool-id}-secondary-btn`
- Clear button with ID: `clear-{tool-id}-btn`
- Copy button with ID: `copy-{tool-id}-btn`

### JSON Processing Tool

Specialized template for JSON tools with syntax highlighting and validation.

```javascript
const html = uiTemplates.jsonProcessingTool({
    title: 'JSON Beautifier',
    inputLabel: 'Raw JSON',
    outputLabel: 'Formatted JSON',
    actions: ['Beautify', 'Minify', 'Validate'],
    showStats: true
});
```

### Comparison Tool

For tools that compare two inputs (diff tools, etc.).

```javascript
const html = uiTemplates.comparisonTool({
    title: 'JSON Diff',
    leftLabel: 'JSON 1',
    rightLabel: 'JSON 2',
    resultLabel: 'Differences',
    compareAction: 'Compare',
    inputRows: 15
});
```

### Form Tool

For generator tools and configuration forms.

```javascript
const html = uiTemplates.formTool({
    title: 'Password Generator',
    fields: [
        {
            id: 'length',
            label: 'Length',
            type: 'input',
            placeholder: '12'
        },
        {
            id: 'include-symbols',
            label: 'Include Symbols',
            type: 'checkbox'
        }
    ],
    actions: ['Generate', 'Copy'],
    showResult: true,
    resultLabel: 'Generated Password'
});
```

### Live Tool

For real-time processing tools.

```javascript
const html = uiTemplates.liveTool({
    title: 'Live Markdown Preview',
    inputLabel: 'Markdown',
    outputLabel: 'Preview',
    showStats: true
});
```

## Integration with BaseTool

### 1. Template Integration

```html
<!-- In your tool's HTML template -->
{% extends "base.html" %}

{% block content %}
<script>
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const container = document.querySelector('main .container');
            if (!container) return;

            // Generate UI
            const html = uiTemplates.textProcessingTool({
                title: 'My Tool',
                primaryAction: 'Process'
            });

            container.innerHTML = html;

            // Rebind events
            if (window.appManager?.rebindCurrentTool) {
                window.appManager.rebindCurrentTool();
            }
        }, 100);
    });
</script>

<div class="container"></div>
{% endblock %}
```

### 2. Tool Class Configuration

```javascript
export default class MyTool extends BaseTool {
    constructor() {
        super({
            name: 'My Tool',
            inputFields: [
                { id: 'my-tool-input', name: 'Input', required: true }
            ],
            outputFields: [
                { id: 'my-tool-output', copyable: true }
            ],
            buttons: [
                { id: 'my-tool-btn', action: 'process' },
                { id: 'clear-my-tool-btn', action: 'clearAll' },
                { id: 'copy-my-tool-btn', action: 'copyOutput' }
            ]
        });
    }

    async process() {
        const input = ui.getValue('my-tool-input');
        const result = this.processInput(input);
        ui.setValue('my-tool-output', result);
    }
}
```

## ID Naming Convention

The framework uses predictable ID patterns:

- **Input fields:** `{tool-slug}-input`
- **Output fields:** `{tool-slug}-output`
- **Primary button:** `{tool-slug}-btn`
- **Secondary button:** `{tool-slug}-secondary-btn`
- **Clear button:** `clear-{tool-slug}-btn`
- **Copy button:** `copy-{tool-slug}-btn`

Where `{tool-slug}` is the tool title converted to lowercase with spaces/special chars replaced by hyphens.

Example: "JSON Beautifier" → `json-beautifier`

## Button Variants

```javascript
// Primary action button (blue)
{ variant: 'primary' }

// Secondary action button (gray)
{ variant: 'secondary' }

// Accent button (purple)
{ variant: 'accent' }

// Neutral button (dark gray)
{ variant: 'neutral' }

// Danger button (red)
{ variant: 'danger' }

// Success button (green)
{ variant: 'success' }
```

## Field Types

```javascript
// Text input
{
    type: 'input',
    id: 'my-input',
    label: 'Label',
    placeholder: 'Placeholder text',
    required: true
}

// Textarea
{
    type: 'textarea',
    id: 'my-textarea',
    label: 'Label',
    rows: 10,
    monospace: true,
    readonly: false
}

// Select dropdown
{
    type: 'select',
    id: 'my-select',
    label: 'Choose option',
    options: [
        { value: 'opt1', text: 'Option 1' },
        { value: 'opt2', text: 'Option 2' }
    ]
}

// Checkbox
{
    type: 'checkbox',
    id: 'my-checkbox',
    label: 'Enable feature',
    checked: false
}
```

## Stats Component

```javascript
// Add stats section
{
    type: 'stats',
    className: 'md:col-span-2',
    items: [
        { id: 'char-count', label: 'Characters', value: '0', color: 'blue' },
        { id: 'line-count', label: 'Lines', value: '0', color: 'green' },
        { id: 'file-size', label: 'Size', value: '0 KB', color: 'purple' }
    ]
}
```

## Auto-Generation

For quick prototyping, use the auto-generation feature:

```javascript
const html = uiTemplates.autoGenerate({
    type: 'text-processing', // Auto-detects best template
    title: 'My Tool',
    primaryAction: 'Process'
});
```

Supported auto-types:
- `text-processing` / `encoder` / `decoder`
- `json` / `json-tool`
- `comparison` / `diff`
- `form` / `generator`
- `live` / `realtime`

## Best Practices

### 1. Consistent Naming
Always use descriptive, consistent naming for IDs that match your tool's purpose.

### 2. Event Rebinding
Always call `appManager.rebindCurrentTool()` after dynamically generating UI.

### 3. Error Handling
Use `uiUtils.showMessage()` for user feedback:

```javascript
try {
    const result = await this.processData(input);
    ui.setValue('output', result);
    uiUtils.showMessage('Processing complete!', 'success');
} catch (error) {
    uiUtils.showMessage(`Error: ${error.message}`, 'error');
}
```

### 4. Loading States
Show loading states for async operations:

```javascript
async process() {
    uiUtils.updateButtonState('process-btn', { loading: true });

    try {
        // ... do work
    } finally {
        uiUtils.updateButtonState('process-btn', { loading: false });
    }
}
```

### 5. Validation
Use built-in validation or custom validation:

```javascript
// Built-in validation
if (!this.validateInputs()) {
    return;
}

// Custom validation
const input = ui.getValue('my-input');
if (!input.trim()) {
    uiUtils.showMessage('Input is required', 'error');
    return;
}
```

## Advanced Usage

### Custom Layouts

```javascript
const html = uiBuilder.buildToolUI({
    title: 'Advanced Tool',
    layout: 'three-column', // single-column, two-column, three-column
    maxWidth: '7xl',
    sections: [
        {
            title: 'Input',
            className: 'md:col-span-2',
            fields: [...],
            buttons: [...]
        },
        {
            title: 'Settings',
            className: 'md:col-span-1',
            fields: [...],
            buttons: [...]
        }
    ]
});
```

### Custom Styling

```javascript
const button = uiBuilder.createButton({
    id: 'custom-btn',
    text: 'Custom',
    className: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
});
```

## Migration Guide

### From Manual HTML to Framework

**Before:**
```html
<div class="space-y-6">
    <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Input</label>
        <textarea id="input" class="w-full px-3 py-2 bg-gray-700..."></textarea>
    </div>
    <button id="process-btn" class="bg-blue-600...">Process</button>
</div>
```

**After:**
```javascript
const html = uiTemplates.textProcessingTool({
    title: 'My Tool',
    primaryAction: 'Process'
});
```

This reduces 50+ lines of HTML to just a few lines of configuration!

## Performance Features

- **Debounced updates** for real-time processing
- **Auto-resize** textareas for better UX
- **Keyboard shortcuts** (Ctrl+Enter for primary action, Escape to clear)
- **Responsive** layouts that work on all screen sizes
- **Accessible** components with proper ARIA labels

## Examples

See the URL Encoder tool (`/static/js/tools/url-encoder/`) for a complete example of how to:

1. Use the UI framework to generate interfaces
2. Handle user interactions with utilities
3. Provide real-time feedback and stats
4. Integrate with the existing tool system

## Troubleshooting

### Common Issues

1. **Buttons not working:**
   - Ensure IDs match between template and tool configuration
   - Call `appManager.rebindCurrentTool()` after UI generation

2. **Styling issues:**
   - Check that Tailwind classes are correct
   - Ensure framework CSS is loaded

3. **Missing elements:**
   - Verify template configuration is complete
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```javascript
window.uiFrameworkDebug = true;
```

This will log all UI generation steps to help diagnose issues.

---

The CTools UI Framework eliminates the need to write repetitive HTML and CSS while ensuring all tools have a consistent, professional appearance and behavior. The framework dramatically reduces development time while ensuring consistent, professional-looking tools. Start with the templates and customize as needed for your specific use case.
