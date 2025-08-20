#!/bin/bash
# Alternative shell script launcher for CTools

# Configuration
HOST="127.0.0.1"
PORT="5001"
APP_URL="http://${HOST}:${PORT}"
APP_FILE="app.py"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CTools Launcher${NC}"
echo "=============================="

# Check if app.py exists
if [ ! -f "$APP_FILE" ]; then
    echo -e "${RED}✗ $APP_FILE not found in current directory${NC}"
    echo "Please run this script from the CTools project directory"
    exit 1
fi

# Function to check if server is running
check_server() {
    curl -s --connect-timeout 1 "$APP_URL" >/dev/null 2>&1
    return $?
}

# Function to wait for server
wait_for_server() {
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}Waiting for server to be ready...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if check_server; then
            return 0
        fi
        sleep 0.5
        ((attempt++))
    done
    
    return 1
}

# Check if server is already running
if check_server; then
    echo -e "${GREEN}✓ Server already running at $APP_URL${NC}"
else
    echo -e "${YELLOW}Starting Flask server at $APP_URL...${NC}"
    echo -e "${BLUE}Activating pyenv environment 'ctools'...${NC}"
    
    # Start server in background with pyenv activation
    bash -c 'eval "$(pyenv init -)" && pyenv activate ctools && python app.py' > /dev/null 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    if wait_for_server; then
        echo -e "${GREEN}✓ Server started successfully at $APP_URL${NC}"
    else
        echo -e "${RED}✗ Server failed to start within expected time${NC}"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
fi

# Open browser
echo -e "${YELLOW}Opening browser to $APP_URL...${NC}"

# Detect OS and open browser accordingly
case "$OSTYPE" in
    darwin*)  # macOS
        open "$APP_URL"
        ;;
    linux*)   # Linux
        if command -v xdg-open > /dev/null; then
            xdg-open "$APP_URL"
        elif command -v firefox > /dev/null; then
            firefox "$APP_URL" &
        elif command -v google-chrome > /dev/null; then
            google-chrome "$APP_URL" &
        elif command -v chromium-browser > /dev/null; then
            chromium-browser "$APP_URL" &
        else
            echo -e "${RED}✗ Could not find a browser to open${NC}"
            echo "Please open $APP_URL manually"
        fi
        ;;
    msys*|cygwin*)  # Windows (Git Bash/Cygwin)
        start "$APP_URL"
        ;;
    *)
        echo -e "${YELLOW}⚠ Unknown OS, trying default browser...${NC}"
        bash -c 'eval "$(pyenv init -)" && pyenv activate ctools && python -c "import webbrowser; webbrowser.open(\"'$APP_URL'\")"'
        ;;
esac

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Browser opened successfully${NC}"
else
    echo -e "${RED}✗ Error opening browser${NC}"
fi

echo ""
echo -e "${GREEN}🎉 CTools is ready!${NC}"
echo -e "   Home: $APP_URL"
echo -e "   Base64: $APP_URL/base64"
echo -e "   JSON Beautify: $APP_URL/json-beautify"
echo -e "   JSON Diff: $APP_URL/json-diff"
echo ""
echo -e "${BLUE}💡 Tip: Keep this terminal open to keep the server running${NC}"
echo -e "   Press Ctrl+C to stop the server"

# If we started the server, wait for it and handle cleanup
if [ ! -z "$SERVER_PID" ]; then
    # Function to cleanup on exit
    cleanup() {
        echo ""
        echo -e "${YELLOW}🛑 Shutting down server...${NC}"
        kill $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
        echo -e "${GREEN}✓ Server stopped${NC}"
        exit 0
    }
    
    # Set trap for cleanup
    trap cleanup INT TERM
    
    # Wait for server process
    wait $SERVER_PID
fi