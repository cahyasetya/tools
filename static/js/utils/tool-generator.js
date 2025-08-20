/**
 * Tool Generator - Utility for creating new tools quickly
 * Provides templates and scaffolding for new tool development
 */
class ToolGenerator {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }

    /**
     * Initialize built-in templates
     */
    initializeTemplates() {
        // Basic tool template
        this.templates.set('basic', {
            name: 'Basic Tool Template',
            description: 'Simple tool with input/output fields',
            files: {
                'index.js': this.getBasicToolTemplate(),
                'manifest.json': this.getBasicManifestTemplate()
            }
        });

        // API-based tool template
        this.templates.set('api', {
            name: 'API Tool Template',
            description: 'Tool that makes API calls',
            files: {
                'index.js': this.getApiToolTemplate(),
                'manifest.json': this.getApiManifestTemplate()
            }
        });

        // File processing tool template
        this.templates.set('file', {
            name: 'File Processing Template',
            description: 'Tool for processing uploaded files',
            files: {
                'index.js': this.getFileToolTemplate(),
                'manifest.json': this.getFileManifestTemplate()
            }
        });
    }

    /**
     * Generate a new tool
     */
    generateTool(config) {
        const {
            id,
            name,
            category = 'misc',
            template = 'basic',
            author = 'CTools User',
            description = '',
            features = []
        } = config;

        if (!id || !name) {
            throw new Error('Tool ID and name are required');
        }

        const templateConfig = this.templates.get(template);
        if (!templateConfig) {
            throw new Error(`Template ${template} not found`);
        }

        // Generate files from template
        const files = {};
        Object.entries(templateConfig.files).forEach(([filename, content]) => {
            files[filename] = this.processTemplate(content, {
                id,
                name,
                category,
                author,
                description,
                features
            });
        });

        return {
            id,
            name,
            category,
            files,
            instructions: this.getSetupInstructions(id)
        };
    }

    /**
     * Process template with variables
     */
    processTemplate(template, variables) {
        let processed = template;
        
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            const arrayPlaceholder = `{{${key}_array}}`;
            
            if (Array.isArray(value)) {
                processed = processed.replace(
                    new RegExp(arrayPlaceholder, 'g'),
                    JSON.stringify(value)
                );
            }
            
            processed = processed.replace(
                new RegExp(placeholder, 'g'),
                String(value)
            );
        });

        return processed;
    }

    /**
     * Basic tool template
     */
    getBasicToolTemplate() {
        return `/**
 * {{name}} Tool
 * {{description}}
 */

export default class {{id}}Tool extends BaseTool {
    constructor() {
        super({
            name: '{{name}}',
            inputFields: [
                { id: 'input', name: 'Input', required: true }
            ],
            outputFields: [
                { id: 'output', copyable: true }
            ],
            buttons: [
                { id: 'process-btn', action: 'processInput' },
                { id: 'clear-btn', action: 'clearAll' }
            ]
        });
    }

    async processInput() {
        const input = ui.getValue('input');
        if (!input) {
            ui.showMessage('Please enter input to process', 'error');
            return;
        }

        try {
            // Process the input here
            const result = await this.processData(input);
            
            ui.setValue('output', result);
            ui.showMessage('Processing completed', 'success');
        } catch (error) {
            ui.showMessage(error.message, 'error');
        }
    }

    async processData(input) {
        // Implement your processing logic here
        return input.toUpperCase(); // Example transformation
    }

    clearAll() {
        this.clearFields();
    }
}`;
    }

    /**
     * API tool template
     */
    getApiToolTemplate() {
        return `/**
 * {{name}} Tool
 * {{description}}
 */

export default class {{id}}Tool extends BaseTool {
    constructor() {
        super({
            name: '{{name}}',
            inputFields: [
                { id: 'input', name: 'Input Data', required: true }
            ],
            outputFields: [
                { id: 'output', copyable: true }
            ],
            buttons: [
                { id: 'submit-btn', action: 'submitData' },
                { id: 'clear-btn', action: 'clearAll' }
            ]
        });

        // Add custom API endpoint
        this.apiEndpoint = '/api/{{id}}';
    }

    async submitData() {
        const input = ui.getValue('input');
        if (!input) {
            ui.showMessage('Please enter data to submit', 'error');
            return;
        }

        try {
            const result = await this.callAPI(input);
            
            if (result.success) {
                ui.setValue('output', result.data);
                ui.showMessage('Data processed successfully', 'success');
            } else {
                ui.showMessage(result.error, 'error');
            }
        } catch (error) {
            ui.showMessage(error.message, 'error');
        }
    }

    async callAPI(data) {
        return api.post(this.apiEndpoint, { data });
    }

    clearAll() {
        this.clearFields();
    }
}`;
    }

    /**
     * File processing tool template
     */
    getFileToolTemplate() {
        return `/**
 * {{name}} Tool
 * {{description}}
 */

export default class {{id}}Tool extends BaseTool {
    constructor() {
        super({
            name: '{{name}}',
            inputFields: [
                { id: 'file-input', name: 'Upload File', type: 'file', required: true }
            ],
            outputFields: [
                { id: 'output', copyable: true },
                { id: 'download-link', type: 'download' }
            ],
            buttons: [
                { id: 'process-btn', action: 'processFile' },
                { id: 'clear-btn', action: 'clearAll' }
            ]
        });
    }

    async processFile() {
        const fileInput = ui.getElement('file-input');
        const file = fileInput.files[0];
        
        if (!file) {
            ui.showMessage('Please select a file to process', 'error');
            return;
        }

        try {
            const result = await this.handleFile(file);
            
            ui.setValue('output', result.text);
            
            if (result.downloadData) {
                this.createDownloadLink(result.downloadData, result.filename);
            }
            
            ui.showMessage('File processed successfully', 'success');
        } catch (error) {
            ui.showMessage(error.message, 'error');
        }
    }

    async handleFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    
                    // Process file content here
                    const processed = this.transformFileContent(content);
                    
                    resolve({
                        text: processed,
                        downloadData: processed,
                        filename: \`processed-\${file.name}\`
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    transformFileContent(content) {
        // Implement your file transformation logic here
        return content.trim().toUpperCase();
    }

    createDownloadLink(data, filename) {
        const downloadElement = ui.getElement('download-link');
        if (downloadElement) {
            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            downloadElement.innerHTML = \`
                <a href="\${url}" download="\${filename}" 
                   class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                    📥 Download Result
                </a>
            \`;
        }
    }

    clearAll() {
        this.clearFields();
        
        // Clear download link
        const downloadElement = ui.getElement('download-link');
        if (downloadElement) {
            downloadElement.innerHTML = '';
        }
    }
}`;
    }

    /**
     * Basic manifest template
     */
    getBasicManifestTemplate() {
        return `{
  "name": "{{name}}",
  "version": "1.0.0",
  "author": "{{author}}",
  "description": "{{description}}",
  "category": "{{category}}",
  "tags": {{features_array}},
  "routes": ["/{{id}}"],
  "dependencies": [],
  "features": {{features_array}},
  "icon": "🔧",
  "enabled": true
}`;
    }

    /**
     * API manifest template
     */
    getApiManifestTemplate() {
        return `{
  "name": "{{name}}",
  "version": "1.0.0",
  "author": "{{author}}",
  "description": "{{description}}",
  "category": "{{category}}",
  "tags": {{features_array}},
  "routes": ["/{{id}}"],
  "dependencies": [],
  "features": {{features_array}},
  "api": {
    "endpoints": ["/api/{{id}}"],
    "methods": ["POST"]
  },
  "icon": "🌐",
  "enabled": true
}`;
    }

    /**
     * File manifest template
     */
    getFileManifestTemplate() {
        return `{
  "name": "{{name}}",
  "version": "1.0.0",
  "author": "{{author}}",
  "description": "{{description}}",
  "category": "{{category}}",
  "tags": {{features_array}},
  "routes": ["/{{id}}"],
  "dependencies": [],
  "features": {{features_array}},
  "fileSupport": {
    "accepts": ["text/*", ".txt", ".csv", ".json"],
    "maxSize": "10MB"
  },
  "icon": "📁",
  "enabled": true
}`;
    }

    /**
     * Get setup instructions for a new tool
     */
    getSetupInstructions(toolId) {
        return `
# Setup Instructions for ${toolId} Tool

## 1. Create Tool Directory
Create a new directory: static/js/tools/${toolId}/

## 2. Add Generated Files
Copy the generated files to the tool directory:
- index.js (main tool implementation)
- manifest.json (tool metadata)

## 3. Update Tool Manifest
Edit static/js/tools/manifest.json and add your tool:

\`\`\`json
"${toolId}": {
  // Copy content from generated manifest.json
}
\`\`\`

## 4. Create Flask Route (if needed)
Add route to app.py:

\`\`\`python
@app.route('/${toolId}')
def ${toolId}_tool():
    return render_template('${toolId}.html')
\`\`\`

## 5. Create HTML Template
Create templates/${toolId}.html with your UI.

## 6. Test Your Tool
Navigate to /${toolId} to test your new tool!

## 7. Optional: Add API Endpoints
If your tool needs backend processing, add API routes to app.py.
        `.trim();
    }

    /**
     * Generate CLI command for creating tools
     */
    generateCLICommand(config) {
        const { id, name, template = 'basic' } = config;
        
        return `
# Quick tool generation command:
# Add this to your package.json scripts:

"generate-tool": "node -e \\"
const generator = new (require('./static/js/utils/tool-generator.js'))();
const result = generator.generateTool({
  id: '${id}',
  name: '${name}',
  template: '${template}'
});
console.log('Generated tool: ', result.id);
console.log(result.instructions);
\\""

# Then run: npm run generate-tool
        `.trim();
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolGenerator;
}

// Make available in browser
if (typeof window !== 'undefined') {
    window.ToolGenerator = ToolGenerator;
}`;
    }

    /**
     * Export tool as package
     */
    exportTool(toolId) {
        const tool = toolRegistry.getTool(toolId);
        if (!tool) {
            throw new Error(`Tool ${toolId} not found`);
        }

        const packageData = {
            name: `ctools-${toolId}`,
            version: tool.manifest.version,
            description: tool.manifest.description,
            author: tool.manifest.author,
            keywords: tool.manifest.tags,
            main: 'index.js',
            files: ['index.js', 'manifest.json', 'README.md'],
            ctoolsPlugin: true
        };

        return {
            'package.json': JSON.stringify(packageData, null, 2),
            'README.md': this.generateReadme(tool),
            instructions: 'Tool exported as npm package structure'
        };
    }

    /**
     * Generate README for exported tool
     */
    generateReadme(tool) {
        return `# ${tool.manifest.name}

${tool.manifest.description}

## Installation

\`\`\`bash
# Copy files to your CTools installation
cp index.js /path/to/ctools/static/js/tools/${tool.id}/
cp manifest.json /path/to/ctools/static/js/tools/${tool.id}/
\`\`\`

## Features

${tool.manifest.features.map(f => `- ${f}`).join('\n')}

## Tags

${tool.manifest.tags.map(t => `\`${t}\``).join(', ')}

## Author

${tool.manifest.author}

## Version

${tool.manifest.version}
`;
    }
}

// Global tool generator instance
window.toolGenerator = new ToolGenerator();`;