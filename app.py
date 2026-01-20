from flask import Flask, render_template, request, jsonify
import base64
import json
import difflib

app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/base64')
def base64_tool():
    return render_template('base64.html')

@app.route('/json-beautify')
def json_beautify_tool():
    return render_template('json_beautify.html')

@app.route('/json-diff')
def json_diff_tool():
    return render_template('json_diff.html')

@app.route('/tool-generator')
def tool_generator():
    return render_template('tool_generator.html')

@app.route('/epoch-converter')
def epoch_converter():
    return render_template('epoch_converter.html')

@app.route('/url-encoder')
def url_encoder():
    return render_template('url_encoder.html')

@app.route('/uuid-generator')
def uuid_generator():
    return render_template('uuid_generator.html')

@app.route('/api/base64/encode', methods=['POST'])
def base64_encode():
    try:
        text = request.json.get('text', '')
        encoded = base64.b64encode(text.encode('utf-8')).decode('utf-8')
        return jsonify({'result': encoded})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/base64/decode', methods=['POST'])
def base64_decode():
    try:
        encoded_text = request.json.get('text', '')
        decoded = base64.b64decode(encoded_text).decode('utf-8')
        return jsonify({'result': decoded})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/json/beautify', methods=['POST'])
def json_beautify():
    try:
        json_text = request.json.get('json', '')
        parsed = json.loads(json_text)
        beautified = json.dumps(parsed, indent=2, ensure_ascii=False)
        return jsonify({'result': beautified})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/json/diff', methods=['POST'])
def json_diff():
    try:
        json1 = request.json.get('json1', '')
        json2 = request.json.get('json2', '')
        
        # Parse and format both JSONs
        parsed1 = json.loads(json1)
        parsed2 = json.loads(json2)
        formatted1 = json.dumps(parsed1, indent=2, sort_keys=True).splitlines()
        formatted2 = json.dumps(parsed2, indent=2, sort_keys=True).splitlines()
        
        # Generate diff
        diff = list(difflib.unified_diff(formatted1, formatted2, lineterm='', fromfile='JSON 1', tofile='JSON 2'))
        return jsonify({'result': '\n'.join(diff)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)