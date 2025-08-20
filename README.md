# CTools - Developer Web Utilities

A simple, lightweight web-based toolkit for common developer tasks. Built with Python Flask and styled with Tailwind CSS for a clean, modern interface.

## Features

### 🔤 Base64 Encoder/Decoder
- Encode text to Base64 format
- Decode Base64 strings back to text
- Copy results to clipboard
- Real-time validation and error handling

### 📝 JSON Beautifier
- Format and prettify JSON data
- Minify JSON for compact output
- Validate JSON syntax
- Display character count, line count, and file size
- Copy formatted results

### 🔍 JSON Diff Tool
- Compare two JSON objects side by side
- Visual diff with color-coded additions and removals
- Unified diff format output
- Individual JSON validation
- Copy diff results

## Quick Start

### Option 1: Using Make (Recommended)
```bash
# Quick setup and run
make quick-start

# Then activate virtual environment and run
source venv/bin/activate
make run
```

### Option 2: Manual Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

### Option 3: Using Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

## Usage

1. Start the server using one of the methods above
2. Open your browser and navigate to `http://localhost:5000`
3. Choose from the available tools:
   - **Base64**: `/base64` - Encode/decode Base64 strings
   - **JSON Beautify**: `/json-beautify` - Format and validate JSON
   - **JSON Diff**: `/json-diff` - Compare JSON objects

## Make Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make venv` | Create virtual environment and install dependencies |
| `make run` | Start the web server |
| `make dev` | Start server in development mode |
| `make test` | Run basic application tests |
| `make lint` | Check code style |
| `make format` | Format code with black |
| `make clean` | Remove temporary files and virtual environment |
| `make server-info` | Display server information and endpoints |

## API Endpoints

### Base64 Operations
- `POST /api/base64/encode` - Encode text to Base64
- `POST /api/base64/decode` - Decode Base64 to text

### JSON Operations
- `POST /api/json/beautify` - Format and beautify JSON
- `POST /api/json/diff` - Compare two JSON objects

### Example API Usage
```bash
# Encode text to Base64
curl -X POST http://localhost:5000/api/base64/encode \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World"}'

# Beautify JSON
curl -X POST http://localhost:5000/api/json/beautify \
  -H "Content-Type: application/json" \
  -d '{"json": "{\"name\":\"John\",\"age\":30}"}'
```

## Project Structure

```
ctools/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Makefile              # Build and run commands
├── README.md             # This file
└── templates/            # HTML templates
    ├── base.html         # Base template with navigation
    ├── index.html        # Home page
    ├── base64.html       # Base64 tool
    ├── json_beautify.html # JSON formatter
    └── json_diff.html    # JSON comparison tool
```

## Requirements

- Python 3.6 or higher
- Flask 2.3.3
- Modern web browser with JavaScript support

## Configuration

The server runs on `http://0.0.0.0:5000` by default. You can modify the host and port in `app.py`:

```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

## Development

### Adding New Tools

1. Add route handlers in `app.py`
2. Create HTML template in `templates/`
3. Add navigation link in `templates/base.html`
4. Update the home page cards in `templates/index.html`

### Code Style

The project uses:
- **Flask** for the web framework
- **Tailwind CSS** (CDN) for styling
- **Vanilla JavaScript** for frontend interactions
- **Python standard library** for utilities (base64, json, difflib)

### Development Mode

Run in development mode for auto-reload:
```bash
make dev
# or
FLASK_ENV=development FLASK_DEBUG=1 python app.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Check code style: `make lint`
6. Submit a pull request

## License

This project is open source and available under the MIT License.

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Permission denied:**
```bash
# Use virtual environment
make venv
source venv/bin/activate
```

**Module not found:**
```bash
# Make sure you're in the project directory and dependencies are installed
pip install -r requirements.txt
```

## Roadmap

Future enhancements could include:
- [ ] URL encoder/decoder
- [ ] Hash generators (MD5, SHA1, SHA256)
- [ ] JWT token decoder
- [ ] XML formatter
- [ ] YAML to JSON converter
- [ ] QR code generator
- [ ] Color palette tools
- [ ] Regex tester
- [ ] Unix timestamp converter

---

**Made for developers, by developers.** Simple tools for everyday tasks.