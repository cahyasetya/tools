#!/usr/bin/env python
"""
Launch script for CTools web application.
Opens browser to the app's home page, starting the server if needed.
"""

import subprocess
import time
import webbrowser
import requests
import threading
import sys
import os
from urllib.parse import urljoin

# Configuration
HOST = '127.0.0.1'
PORT = 5001
APP_URL = f'http://{HOST}:{PORT}'
APP_FILE = 'app.py'

def is_server_running(url, timeout=1):
    """Check if the Flask server is already running."""
    try:
        response = requests.get(url, timeout=timeout)
        return response.status_code == 200
    except (requests.exceptions.RequestException, requests.exceptions.Timeout):
        return False

def start_server():
    """Start the Flask server in a separate process."""
    print(f"Starting Flask server at {APP_URL}...")
    try:
        # Activate pyenv environment and run app
        env = os.environ.copy()
        
        # Start server as a subprocess with pyenv activation
        process = subprocess.Popen([
            'bash', '-c', 'eval "$(pyenv init -)" && pyenv activate ctools && python app.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
        
        # Wait for server to start
        max_attempts = 30
        for attempt in range(max_attempts):
            if is_server_running(APP_URL):
                print(f"✓ Server started successfully at {APP_URL}")
                return process
            
            # Check if process has terminated with error
            if process.poll() is not None:
                stdout, stderr = process.communicate()
                print(f"✗ Server process terminated. Error: {stderr.decode()}")
                return None
                
            time.sleep(0.5)
        
        print("✗ Server failed to start within expected time")
        # Get any error output
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            if stderr:
                print(f"Error output: {stderr.decode()}")
        return None
    except Exception as e:
        print(f"✗ Error starting server: {e}")
        return None

def open_browser(url):
    """Open browser to the specified URL."""
    try:
        print(f"Opening browser to {url}...")
        webbrowser.open(url)
        print("✓ Browser opened successfully")
        return True
    except Exception as e:
        print(f"✗ Error opening browser: {e}")
        return False

def wait_for_server(url, max_wait=10):
    """Wait for server to be ready to serve requests."""
    print("Waiting for server to be ready...")
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        if is_server_running(url):
            return True
        time.sleep(0.2)
    
    return False

def main():
    """Main launch function."""
    print("🚀 CTools Launcher")
    print("=" * 30)
    
    # Check if app.py exists
    if not os.path.exists(APP_FILE):
        print(f"✗ {APP_FILE} not found in current directory")
        print("Please run this script from the CTools project directory")
        return 1
    
    server_process = None
    
    try:
        # Check if server is already running
        if is_server_running(APP_URL):
            print(f"✓ Server already running at {APP_URL}")
        else:
            # Start the server
            server_process = start_server()
            if not server_process:
                print("✗ Failed to start server")
                return 1
            
            # Wait for server to be ready
            if not wait_for_server(APP_URL):
                print("✗ Server is not responding")
                return 1
        
        # Open browser
        if open_browser(APP_URL):
            print("\n🎉 CTools is ready!")
            print(f"   Home: {APP_URL}")
            print(f"   Base64: {APP_URL}/base64")
            print(f"   JSON Beautify: {APP_URL}/json-beautify") 
            print(f"   JSON Diff: {APP_URL}/json-diff")
            print("\n💡 Tip: Keep this terminal open to keep the server running")
            print("   Press Ctrl+C to stop the server")
            
            if server_process:
                try:
                    # Keep the script running to maintain the server
                    server_process.wait()
                except KeyboardInterrupt:
                    print("\n\n🛑 Shutting down server...")
                    server_process.terminate()
                    server_process.wait()
                    print("✓ Server stopped")
        else:
            print("✗ Failed to open browser")
            if server_process:
                server_process.terminate()
            return 1
            
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down...")
        if server_process:
            server_process.terminate()
            server_process.wait()
        print("✓ Cleanup complete")
        return 0
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        if server_process:
            server_process.terminate()
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())