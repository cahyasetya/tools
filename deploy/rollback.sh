#!/bin/bash
set -e

# Rollback Script
# Rolls back to the previous deployed version

echo "🔄 Starting rollback process..."

# Load configuration and version utilities
source "$(dirname "$0")/config.sh"
source "$(dirname "$0")/version.sh"

# Ensure we're in the app directory
cd "$APP_DIR"

# Get current and previous versions
CURRENT_VERSION=$(get_current_version)
PREVIOUS_VERSION=$(get_previous_version)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Rollback Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current version:  $CURRENT_VERSION"
echo "Rollback to:      $PREVIOUS_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Confirm rollback
read -p "⚠️  Are you sure you want to rollback? (yes/no): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

# Check if previous version exists
if [ "$PREVIOUS_VERSION" == "No previous version found" ] || [ -z "$PREVIOUS_VERSION" ]; then
    echo "❌ No previous version available for rollback"
    exit 1
fi

echo "📥 Fetching version $PREVIOUS_VERSION..."
git fetch --tags origin

# Checkout previous version
if checkout_version "$PREVIOUS_VERSION"; then
    # Install/update dependencies
    echo "📦 Installing dependencies..."
    if [ ! -d "$VENV_DIR" ]; then
        $PYTHON_VERSION -m venv "$VENV_DIR"
    fi

    source "$VENV_DIR/bin/activate"
    pip install -r requirements.txt

    # Generate systemd service configuration with version
    echo "⚙️  Generating systemd service configuration..."
    if [ -f "deploy/${SERVICE_NAME}.service" ]; then
        # Create a temporary service file with version in description
        TEMP_SERVICE="/tmp/${SERVICE_NAME}.service.tmp"

        # Read the template and replace the description with version info
        sed "s/Description=CTools Web Application/Description=CTools Web Application ($PREVIOUS_VERSION - rolled back)/" \
            "deploy/${SERVICE_NAME}.service" > "$TEMP_SERVICE"

        # Copy the modified service file
        sudo cp "$TEMP_SERVICE" "$SYSTEMD_SERVICE_PATH"
        rm "$TEMP_SERVICE"

        sudo systemctl daemon-reload
        echo "✅ Service configured with version: $PREVIOUS_VERSION"
    fi

    # Restart service
    echo "🔄 Restarting service..."
    sudo systemctl restart "$SERVICE_NAME"

    # Verify
    sleep 2
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "✅ Service is running on version $PREVIOUS_VERSION"
        sudo systemctl status "$SERVICE_NAME" --no-pager -l

        # Log the rollback
        log_deployment "$PREVIOUS_VERSION (rollback from $CURRENT_VERSION)"

        echo "🎉 Rollback completed successfully!"
    else
        echo "❌ Service failed to start after rollback"
        sudo journalctl -u "$SERVICE_NAME" --no-pager -n 20
        exit 1
    fi
else
    echo "❌ Failed to checkout version $PREVIOUS_VERSION"
    exit 1
fi
