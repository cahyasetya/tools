#!/usr/bin/env python
"""
Quick script to check pyenv Python setup
"""
import sys
import subprocess

def main():
    print("🐍 Python Environment Check")
    print("=" * 30)
    
    # Python version and path
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    
    # Check if pyenv is available
    try:
        result = subprocess.run(['pyenv', 'version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"Pyenv version: {result.stdout.strip()}")
        else:
            print("Pyenv not found or not working")
    except FileNotFoundError:
        print("Pyenv not installed")
    
    # Check pip
    try:
        import pip
        print(f"Pip version: {pip.__version__}")
    except ImportError:
        print("Pip not available")
    
    # Check Flask availability
    try:
        import flask
        print(f"Flask version: {flask.__version__}")
    except ImportError:
        print("Flask not installed - run: pip install -r requirements.txt")
    
    # Check requests availability  
    try:
        import requests
        print(f"Requests version: {requests.__version__}")
    except ImportError:
        print("Requests not installed - run: pip install -r requirements.txt")
    
    print("\n✓ Environment check complete")

if __name__ == '__main__':
    main()