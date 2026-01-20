# CTools - Quick Reference for Adding Tools

## 🚀 Fast Track (30 seconds)

1. **Open browser console** on your CTools app
2. **Run generator**:
```javascript
toolGenerator.generateTool({
  id: 'my-tool',
  name: 'My Awesome Tool', 
  category: 'text',
  template: 'basic'
});
```
3. **Follow printed instructions**

## 📁 File Structure
```
static/js/tools/my-tool/
├── index.js           # Tool implementation
└── manifest.json      # Metadata (optional)

templates/
└── my_tool.html       # UI template

app.py                 # Add route here
```

## 🏗️ Basic Tool Template

### JavaScript (`static/js/tools/my-tool/index.js`)
```javascript
export default class MyTool extends BaseTool {
    constructor() {
        super({
            name: 'My Tool',
            inputFields: [{ id: 'input', required: true }],
            outputFields: [{ id: 'output', copyable: true }],
            buttons: [{ id: 'process-btn', action: 'process' }]
        });
    }

    async process() {
        const input = ui.getValue('input');
        if (!input) return ui.showMessage('Please enter input', 'error');
        
        const result = input.toUpperCase(); // Your logic here
        ui.setValue('output', result);
        ui.showMessage('Success!', 'success');
    }
}
```

### HTML Template (`templates/my_tool.html`)
```html
{% extends "base.html" %}
{% block content %}
<div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-100 mb-8">My Tool</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <textarea id="input" class="w-full bg-gray-700 border-gray-600 text-gray-100"></textarea>
            <button id="process-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Process</button>
        </div>
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <textarea id="output" class="w-full bg-gray-700 border-gray-600 text-gray-100" readonly></textarea>
        </div>
    </div>
    <div id="message" class="hidden"></div>
</div>
{% endblock %}
```

### Flask Route (`app.py`)
```python
@app.route('/my-tool')
def my_tool():
    return render_template('my_tool.html')
```

## 🎨 Dark Theme Classes
```css
/* Containers */
bg-gray-800 border border-gray-700 shadow-lg

/* Inputs */  
bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400

/* Buttons */
bg-blue-600 hover:bg-blue-700 text-white

/* Text */
text-gray-100 (main) text-gray-300 (labels) text-gray-400 (secondary)
```

## 🛠️ Available Methods

### UI Operations
```javascript
ui.getValue(id)              // Get input value
ui.setValue(id, value)       // Set output value  
ui.showMessage(msg, type)    // Show message (success/error)
ui.copyToClipboard(text)     // Copy to clipboard
```

### API Calls
```javascript
await api.post('/api/endpoint', data)  // Custom API call
await api.encodeBase64(text)           // Built-in Base64
```

### Tool Methods
```javascript
this.clearFields()           // Clear all fields
this.validateInputs()        // Validate required fields
```

## 📋 Categories & Icons
```
encoding  🔤    json     📝    hash     🔐
text      📄    web      🌐    utility  🛠️
```

## 🐛 Debug Commands
```javascript
// Check everything
CToolsDebug.runDiagnostics();

// Fix white elements  
CToolsDebug.forceApplyDarkTheme();

// Check current tool
CToolsDebug.checkCurrentTool();
```

## ⚡ Templates Available

| Template | Use Case | Example |
|----------|----------|---------|
| `basic` | Input → Process → Output | Text transformers, encoders |
| `api` | Needs backend processing | Hash generators, validators |
| `file` | File upload/processing | Converters, analyzers |

## 🔧 Common Patterns

### File Processing
```javascript
async processFile() {
    const fileInput = ui.getElement('file-input');
    const file = fileInput.files[0];
    const content = await this.readFile(file);
    // Process content...
}
```

### API Integration  
```javascript
async callAPI() {
    const response = await fetch('/api/my-endpoint', {
        method: 'POST',
        body: JSON.stringify({data: input})
    });
    const result = await response.json();
}
```

### Error Handling
```javascript
try {
    const result = await this.processData(input);
    ui.setValue('output', result);
    ui.showMessage('Success!', 'success');
} catch (error) {
    ui.showMessage(`Error: ${error.message}`, 'error');
}
```

## ✅ Testing Checklist
- [ ] Tool loads without errors
- [ ] Input validation works
- [ ] Processing works with valid data  
- [ ] Error handling works with invalid data
- [ ] Copy to clipboard works
- [ ] Clear functionality works
- [ ] Dark theme applied correctly
- [ ] Responsive on mobile

## 🚨 Troubleshooting
| Problem | Solution |
|---------|----------|
| Tool not found | Check manifest.json and route |
| White backgrounds | Use dark theme CSS classes |
| JS errors | Check browser console |
| Tool not loading | Run `CToolsDebug.checkRegistry()` |

---

**Need help?** Check the full documentation in `ADDING_TOOLS.md`