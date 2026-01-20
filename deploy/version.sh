#!/bin/bash
# Version management utilities with semantic versioning support

DEPLOYMENT_LOG="/opt/ctools/deploy/deployment-history.log"

# Validate semver format (v1.2.3 or 1.2.3)
validate_semver() {
    local version=$1
    # Remove 'v' prefix if present
    version=${version#v}

    # Check if it matches semver pattern: MAJOR.MINOR.PATCH
    if [[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$ ]]; then
        return 0
    else
        return 1
    fi
}

# Get the latest semver git tag
get_latest_tag() {
    git fetch --tags origin 2>/dev/null

    # Get all tags and filter for semver format
    local tags=$(git tag -l)
    local semver_tags=""

    while IFS= read -r tag; do
        if validate_semver "$tag"; then
            semver_tags="${semver_tags}${tag}\n"
        fi
    done <<< "$tags"

    if [ -z "$semver_tags" ]; then
        echo "No semver tags found. Using commit SHA instead." >&2
        git rev-parse --short HEAD
        return
    fi

    # Sort semver tags properly and get the latest
    local latest_tag=$(echo -e "$semver_tags" | grep -v '^$' | sort -V -r | head -n 1)
    echo "$latest_tag"
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
