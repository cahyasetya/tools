#!/bin/bash
# Version management utilities

DEPLOYMENT_LOG="/opt/ctools/deploy/deployment-history.log"

# Get the latest git tag
get_latest_tag() {
    git fetch --tags origin
    local latest_tag=$(git tag --sort=-v:refname | head -n 1)
    if [ -z "$latest_tag" ]; then
        echo "No tags found. Using commit SHA instead."
        git rev-parse --short HEAD
    else
        echo "$latest_tag"
    fi
}

# Get current deployed version
get_current_version() {
    if [ -f "/opt/ctools/.deployed_version" ]; then
        cat /opt/ctools/.deployed_version
    else
        echo "unknown"
    fi
}

# Get previous deployed version
get_previous_version() {
    if [ -f "$DEPLOYMENT_LOG" ]; then
        tail -n 2 "$DEPLOYMENT_LOG" | head -n 1 | awk '{print $1}'
    else
        echo "No previous version found"
    fi
}

# Log deployment
log_deployment() {
    local version=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$DEPLOYMENT_LOG")"

    # Append to log
    echo "$version $timestamp" >> "$DEPLOYMENT_LOG"

    # Save current version
    echo "$version" > /opt/ctools/.deployed_version
}

# Checkout specific version
checkout_version() {
    local version=$1
    cd /opt/ctools

    # Fetch all tags and commits
    git fetch --tags origin

    # Check if it's a tag
    if git rev-parse "$version" >/dev/null 2>&1; then
        git reset --hard "$version"
        echo "✅ Checked out version: $version"
        return 0
    else
        echo "❌ Version $version not found"
        return 1
    fi
}

# Display version info
show_version_info() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Version Information"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Current version: $(get_current_version)"
    echo "Latest tag:      $(get_latest_tag)"
    echo "Previous version: $(get_previous_version)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}
