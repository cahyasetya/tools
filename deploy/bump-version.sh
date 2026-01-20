#!/bin/bash
set -e

# Version bump script for semantic versioning
# Usage: ./bump-version.sh [major|minor|patch]

BUMP_TYPE=${1:-patch}

# Source version utilities
source "$(dirname "$0")/version.sh"

# Get the latest semver tag
echo "📦 Fetching latest version..."
git fetch --tags origin 2>/dev/null

CURRENT_VERSION=$(get_latest_tag)

# If no version exists or it's a commit SHA, start with v0.0.0
if [[ ! $CURRENT_VERSION =~ ^v?[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    echo "⚠️  No semver tag found. Starting with v0.0.0"
    CURRENT_VERSION="v0.0.0"
fi

# Remove 'v' prefix for calculation
VERSION_NUMBER=${CURRENT_VERSION#v}

# Parse version components
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION_NUMBER"

# Remove any prerelease or build metadata from PATCH
PATCH=${PATCH%%-*}
PATCH=${PATCH%%+*}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Current Version: v$MAJOR.$MINOR.$PATCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Bump version based on type
case $BUMP_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo "❌ Invalid bump type: $BUMP_TYPE"
        echo "Usage: $0 [major|minor|patch]"
        exit 1
        ;;
esac

NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

echo "🚀 Bump Type: $BUMP_TYPE"
echo "📦 New Version: $NEW_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if tag already exists
if git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
    echo "❌ Tag $NEW_VERSION already exists!"
    exit 1
fi

# Create and push new tag
echo "🏷️  Creating tag: $NEW_VERSION"
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION - $BUMP_TYPE version bump"

echo "📤 Pushing tag to origin..."
git push origin "$NEW_VERSION"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successfully created and pushed $NEW_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  • The tag has been pushed to GitHub"
echo "  • Run the deployment workflow to deploy this version"
echo "  • Or push to master to trigger automatic deployment"
