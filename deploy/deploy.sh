#!/bin/bash
set -e

# GitOps Deployment Script
# This script applies the desired state from Git to the server

echo "🚀 Starting GitOps deployment..."

# Load configuration
source "$(dirname "$0")/config.sh"

# Ensure we're in the app directory
cd "$APP_DIR"

# Pull latest code from Git (single source of truth)
echo "📥 Pulling latest code from Git..."
if [ -d ".git" ]; then
    git fetch origin "$GIT_BRANCH"
    git reset --hard origin/"$GIT_BRANCH"
else
    echo "❌ Not a git repository. Clone first."
    exit 1
fi

# Install/update dependencies based on requirements.txt
echo "📦 Installing dependencies..."
if [ ! -d "$VENV_DIR" ]; then
    $PYTHON_VERSION -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
pip install -r requirements.txt

# Apply systemd service configuration (declarative)
echo "⚙️  Applying systemd service configuration..."
if [ -f "deploy/${SERVICE_NAME}.service" ]; then
    sudo cp "deploy/${SERVICE_NAME}.service" "$SYSTEMD_SERVICE_PATH"
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
else
    echo "❌ Service file not found in repository"
    exit 1
fi

# Restart service to apply changes
echo "🔄 Restarting service..."
sudo systemctl restart "$SERVICE_NAME"

# Verify deployment
echo "✅ Verifying deployment..."
sleep 2
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ Service is running"
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
else
    echo "❌ Service failed to start"
    sudo journalctl -u "$SERVICE_NAME" --no-pager -n 20
    exit 1
fi

echo "🎉 GitOps deployment completed successfully!"
