#!/bin/bash
set -e

# GitOps Deployment Script
# This script applies the desired state from Git to the server

echo "🚀 Starting GitOps deployment..."

# Load configuration and version utilities
source "$(dirname "$0")/config.sh"
source "$(dirname "$0")/version.sh"

# Ensure we're in the app directory
cd "$APP_DIR"

# Show current version info
show_version_info

# Pull latest code from Git (single source of truth)
echo "📥 Fetching latest version from Git..."
if [ -d ".git" ]; then
    # Fetch all tags and branches
    git fetch --tags origin "$GIT_BRANCH"

    # Get the latest tag
    DEPLOY_VERSION=$(get_latest_tag)
    echo "🏷️  Deploying version: $DEPLOY_VERSION"

    # Checkout the latest tag
    checkout_version "$DEPLOY_VERSION"

    # Log this deployment
    log_deployment "$DEPLOY_VERSION"
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
