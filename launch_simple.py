#!/usr/bin/env python
"""
Simple direct launcher for CTools
"""
import webbrowser
import subprocess
import time
import sys
import os

def main():
    print("🚀 CTools Direct Launcher")
    print("=" * 30)
    
    # Check if app.py exists
    if not os.path.exists('app.py'):
        print("✗ app.py not found")
        return 1
    
    # Open browser first
    url = 'http://127.0.0.1:5001'
    print(f"Opening browser to {url}...")
    webbrowser.open(url)
    
    # Give browser a moment to open
    time.sleep(1)
    
    print("Starting Flask server...")
    print("🎉 CTools is ready!")
    print(f"   Home: {url}")
    print(f"   Base64: {url}/base64")
    print(f"   JSON Beautify: {url}/json-beautify")
    print(f"   JSON Diff: {url}/json-diff")
    print("\nPress Ctrl+C to stop the server")
    
    # Import and run app directly
    sys.path.insert(0, '.')
    import app
    app.app.run(debug=True, host='0.0.0.0', port=5001)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        sys.exit(0)