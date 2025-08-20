# Adding New Tools to CTools

This guide explains how to add new tools to your CTools platform. There are multiple methods depending on your needs and preferences.

## Table of Contents

1. [Quick Start - Using Tool Generator](#quick-start---using-tool-generator)
2. [Manual Method - Step by Step](#manual-method---step-by-step)
3. [Tool Structure & Architecture](#tool-structure--architecture)
4. [Advanced Tool Features](#advanced-tool-features)
5. [Testing Your Tool](#testing-your-tool)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start - Using Tool Generator

The fastest way to create a new tool is using the built-in tool generator.

### Method 1: Browser Console (Recommended)

1. **Open your CTools app** in browser
2. **Open browser console** (F12 → Console tab)
3. **Generate your tool**:

```javascript
// Basic text processing tool
const newTool = toolGenerator.generateTool({
  id: 'url-encoder',           // Tool ID (used in URLs)
  name: 'URL Encoder/Decoder', // Display name
  category: 'encoding',        // Category (encoding, json, hash, text, web, utility)
  author: 'Your Name',         // Your name
  description: 'Encode and decode URLs and URI components',
  features: ['encode', 'decode', 'component'], // Feature tags
  template: 'basic'            // Template type: basic, api, file
});

console.log(newTool.instructions);
```

4. **Follow the generated instructions** - they'll be printed in the console

### Available Templates

```javascript
// 1. Basic Tool (input → process → output)
template: 'basic'    // Perfect for: text transformers, calculators

// 2. API Tool (makes backend calls)  
template: 'api'      // Perfect for: external services, complex processing

// 3. File Processing Tool (handles uploads)
template: 'file'     // Perfect for: file converters, analyzers
```

### Example - Hash Generator Tool

```javascript
const hashTool = toolGenerator.generateTool({
  id: 'hash-generator',
  name: 'Hash Generator',
  category: 'hash',
  description: 'Generate MD5, SHA1, SHA256 and other hashes',
  features: ['md5', 'sha256', 'sha1', 'bcrypt'],
  template: 'basic'
});
```

---

## Manual Method - Step by Step

If you prefer to create tools manually or need more control:

### Step 1: Create Tool Directory Structure

```bash
mkdir -p static/js/tools/my-new-tool
```

### Step 2: Create Tool Implementation

Create `static/js/tools/my-new-tool/index.js`:

```javascript
/**
 * My New Tool
 * Description of what this tool does
 */

export default class MyNewTool extends BaseTool {
    constructor() {
        super({
            name: 'My New Tool',
            inputFields: [
                { id: 'input-field', name: 'Input Text', required: true }
            ],
            outputFields: [
                { id: 'output-field', copyable: true }
            ],
            buttons: [
                { id: 'process-btn', action: 'processInput' },
                { id: 'clear-btn', action: 'clearAll' }
            ]
        });
    }

    async processInput() {
        const input = ui.getValue('input-field');
        
        if (!input) {
            ui.showMessage('Please enter text to process', 'error');
            return;
        }

        try {
            // Your processing logic here
            const result = this.transformText(input);
            
            ui.setValue('output-field', result);
            ui.showMessage('Processing completed successfully', 'success');
        } catch (error) {
            ui.showMessage(`Error: ${error.message}`, 'error');
        }
    }

    transformText(text) {
        // Example transformation - replace with your logic
        return text.toUpperCase().split('').reverse().join('');
    }

    clearAll() {
        this.clearFields();
    }
}
```

### Step 3: Update Tool Manifest

Edit `static/js/tools/manifest.json` and add your tool:

```json
{
  "tools": {
    "my-new-tool": {
      "name": "My New Tool",
      "version": "1.0.0",
      "author": "Your Name",
      "description": "Description of what this tool does",
      "category": "text",
      "tags": ["text", "transform", "utility"],
      "routes": ["/my-new-tool"],
      "dependencies": [],
      "features": ["transform", "copy", "clear"],
      "icon": "🔧",
      "enabled": true
    }
  }
}
```

### Step 4: Add Flask Route

Add to `app.py`:

```python
@app.route('/my-new-tool')
def my_new_tool():
    return render_template('my_new_tool.html')
```

### Step 5: Create HTML Template

Create `templates/my_new_tool.html`:

```html
{% extends "base.html" %}

{% block title %}My New Tool - CTools{% endblock %}

{% block content %}
<div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-100 mb-8">My New Tool</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Input -->
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Input</h2>
            <div class="space-y-4">
                <div>
                    <label for="input-field" class="block text-sm font-medium text-gray-300 mb-2">Text to Process</label>
                    <textarea id="input-field" rows="10" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your text here..."></textarea>
                </div>
                <button id="process-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Process Text
                </button>
            </div>
        </div>

        <!-- Output -->
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Output</h2>
            <div class="space-y-4">
                <div>
                    <label for="output-field" class="block text-sm font-medium text-gray-300 mb-2">Result</label>
                    <textarea id="output-field" rows="10" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" readonly placeholder="Processed text will appear here..."></textarea>
                </div>
                <div class="flex space-x-4">
                    <button onclick="copyToClipboard('output-field')" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                        Copy Result
                    </button>
                    <button id="clear-btn" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Error/Success Messages -->
    <div id="message" class="mt-4 hidden p-4 rounded-md"></div>
</div>
{% endblock %}
```

### Step 6: Add Navigation Link

Update `templates/base.html` sidebar navigation:

```html
<!-- Add inside the Tools section -->
<a href="/my-new-tool" class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-1 group">
    <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
    My New Tool
</a>
```

---

## Tool Structure & Architecture

### BaseTool Configuration Options

```javascript
super({
    name: 'Tool Display Name',
    
    // Input fields configuration
    inputFields: [
        {
            id: 'field-id',           // HTML element ID
            name: 'Display Name',     // For validation messages
            required: true,           // Whether field is required
            type: 'text'              // Field type (text, file, etc.)
        }
    ],
    
    // Output fields configuration  
    outputFields: [
        {
            id: 'output-id',          // HTML element ID
            copyable: true,           // Add copy functionality
            type: 'text'              // Output type
        }
    ],
    
    // Button configuration
    buttons: [
        {
            id: 'button-id',          // HTML element ID
            action: 'methodName'      // Method to call when clicked
        }
    ],
    
    // Validation settings
    validateInputs: true              // Auto-validate before processing
});
```

### Available Methods in BaseTool

```javascript
// UI Operations
ui.getValue(elementId)               // Get input value
ui.setValue(elementId, value)        // Set output value
ui.clearValue(elementId)             // Clear field
ui.showMessage(message, type)        // Show success/error message
ui.copyToClipboard(text)            // Copy to clipboard

// API Operations
await api.post(endpoint, data)       // Make POST request
await api.encodeBase64(text)         // Built-in Base64 encode
await api.decodeBase64(text)         // Built-in Base64 decode

// Tool Methods
this.clearFields()                   // Clear all input/output fields
this.validateInputs()                // Validate required fields
this.getInputs()                     // Get all inputs as object
```

---

## Advanced Tool Features

### File Processing Tool

```javascript
export default class FileProcessorTool extends BaseTool {
    constructor() {
        super({
            name: 'File Processor',
            inputFields: [
                { id: 'file-input', type: 'file', required: true }
            ],
            outputFields: [
                { id: 'result-output', copyable: true }
            ],
            buttons: [
                { id: 'process-btn', action: 'processFile' }
            ]
        });
    }

    async processFile() {
        const fileInput = ui.getElement('file-input');
        const file = fileInput.files[0];
        
        if (!file) {
            ui.showMessage('Please select a file', 'error');
            return;
        }

        try {
            const content = await this.readFile(file);
            const processed = this.processFileContent(content);
            
            ui.setValue('result-output', processed);
            this.createDownloadLink(processed, `processed-${file.name}`);
            
        } catch (error) {
            ui.showMessage(`Error processing file: ${error.message}`, 'error');
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    processFileContent(content) {
        // Your file processing logic here
        return content.toUpperCase();
    }
}
```

### API Integration Tool

```javascript
export default class APITool extends BaseTool {
    constructor() {
        super({
            name: 'API Integration Tool',
            inputFields: [
                { id: 'data-input', required: true }
            ],
            outputFields: [
                { id: 'api-output', copyable: true }
            ],
            buttons: [
                { id: 'submit-btn', action: 'callAPI' }
            ]
        });
    }

    async callAPI() {
        const data = ui.getValue('data-input');
        
        try {
            // Call your custom API endpoint
            const response = await fetch('/api/my-custom-endpoint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: data })
            });
            
            const result = await response.json();
            
            if (result.error) {
                ui.showMessage(result.error, 'error');
            } else {
                ui.setValue('api-output', result.data);
                ui.showMessage('API call successful', 'success');
            }
        } catch (error) {
            ui.showMessage(`API Error: ${error.message}`, 'error');
        }
    }
}
```

### Tool with Custom Backend (Flask Route)

Add to `app.py`:

```python
@app.route('/api/my-custom-endpoint', methods=['POST'])
def my_custom_endpoint():
    try:
        data = request.json.get('input', '')
        
        # Your backend processing logic here
        result = process_data_on_backend(data)
        
        return jsonify({'data': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def process_data_on_backend(data):
    # Example: hash generation, complex calculations, etc.
    import hashlib
    return hashlib.md5(data.encode()).hexdigest()
```

---

## Testing Your Tool

### 1. Test in Browser Console

```javascript
// Check if tool loaded properly
CToolsDebug.checkRegistry();

// Test current tool
CToolsDebug.checkCurrentTool();

// Force apply dark theme if styling issues
CToolsDebug.forceApplyDarkTheme();
```

### 2. Test Functionality

1. **Navigate to your tool**: `http://localhost:5001/my-new-tool`
2. **Test input validation**: Try empty inputs
3. **Test processing**: Enter valid data
4. **Test error handling**: Enter invalid data
5. **Test copy functionality**: Check clipboard
6. **Test clearing**: Use clear buttons

### 3. Test Tool Registration

```javascript
// In browser console
console.log('Available tools:', Array.from(toolRegistry.tools.keys()));
console.log('Tool categories:', toolRegistry.getCategories());
```

---

## Tool Categories & Icons

### Available Categories

```javascript
categories: {
    'encoding': { name: 'Encoding & Decoding', icon: '🔤', order: 1 },
    'json': { name: 'JSON Tools', icon: '📝', order: 2 },
    'hash': { name: 'Hash & Crypto', icon: '🔐', order: 3 },
    'text': { name: 'Text Processing', icon: '📄', order: 4 },
    'web': { name: 'Web Development', icon: '🌐', order: 5 },
    'utility': { name: 'Utilities', icon: '🛠️', order: 6 }
}
```

### Icon Examples

```
🔤 Encoding tools    📝 JSON tools       🔐 Hash/crypto
📄 Text processing   🌐 Web development  🛠️ Utilities  
🎨 Color tools      📱 QR codes         🔍 Search tools
⏰ Time tools       📊 Data tools       🧮 Math tools
```

---

## Troubleshooting

### Common Issues

#### 1. Tool Not Loading
```javascript
// Check in console:
CToolsDebug.checkSystems();

// If toolRegistry missing, check script loading order
// If tool not found, check manifest.json
```

#### 2. White Background Elements
```javascript
// Force dark theme:
CToolsDebug.forceApplyDarkTheme();

// Or add CSS classes:
// bg-gray-800 (containers), bg-gray-700 (inputs)
```

#### 3. Tool Not Auto-Initializing
```javascript
// Check route mapping in app-manager.js
// Ensure route exists in getToolIdFromRoute()
```

#### 4. API Calls Failing
```javascript
// Test API connectivity:
CToolsDebug.testAPI();

// Check Flask route exists and is accessible
```

### Error Messages

| Error | Solution |
|-------|----------|
| "Tool class not found" | Check tool is exported as `export default` |
| "Failed to register tool" | Check manifest.json syntax |
| "Element not found" | Check HTML element IDs match config |
| "API endpoint not found" | Add Flask route for API calls |

---

## Example Tools for Reference

### 1. Simple Text Transformer
```javascript
// Converts text case, removes spaces, etc.
// Template: basic
// Files: index.js, HTML template
```

### 2. Hash Generator
```javascript
// Generates MD5, SHA256 hashes
// Template: basic (frontend) or api (backend)
// Files: index.js, Flask route (optional)
```

### 3. File Converter
```javascript
// Converts CSV to JSON, etc.
// Template: file
// Files: index.js, HTML with file input
```

### 4. QR Code Generator
```javascript
// Generates QR codes from text
// Template: api (needs external library)
// Files: index.js, Flask route, library dependency
```

---

## Best Practices

1. **Follow naming conventions**: Use kebab-case for IDs
2. **Dark theme first**: Use gray-800, gray-700, gray-600 colors
3. **Error handling**: Always try/catch async operations  
4. **User feedback**: Show success/error messages
5. **Input validation**: Check required fields
6. **Responsive design**: Use Tailwind responsive classes
7. **Accessibility**: Add proper labels and ARIA attributes

---

## Quick Reference Commands

```bash
# Generate tool
toolGenerator.generateTool({id: 'my-tool', name: 'My Tool', template: 'basic'});

# Debug systems  
CToolsDebug.runDiagnostics();

# Test styling
CToolsDebug.checkStyling();

# Check tools
CToolsDebug.checkRegistry();
```

Happy coding! 🚀