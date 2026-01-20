# Deployment and Versioning Guide

## Overview

This project uses GitOps deployment with semantic versioning. The deployment system automatically deploys the latest git tag to the production server.

## Versioning Strategy

- **Version Format**: Semantic Versioning (v1.0.0, v1.1.0, v2.0.0)
- **Deployment Target**: Latest git tag
- **Rollback**: Quick rollback to previous version

## Creating a New Release

### Option 1: Using GitHub Actions (Recommended)

1. **Push your changes** to master branch
2. **Go to GitHub Actions** tab in your repository
3. **Select "Create Release"** workflow
4. **Click "Run workflow"** and choose version bump type:
   - **patch** - Bug fixes (v1.0.0 → v1.0.1)
   - **minor** - New features (v1.1.0 → v1.1.0)
   - **major** - Breaking changes (v2.0.0 → v2.0.0)
5. **Automatic deployment** - The new version tag will be created and deployed automatically

### Option 2: Manual Tag Creation

1. **Create a version tag**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Automatic deployment** - Pushing a tag automatically triggers deployment

## Deployment Process

### Automated Deployment

Deployment is **automatically triggered** when you push a version tag (v*.*.*):

1. Push version tag → GitHub Actions runs "Deploy to Vultr VM" workflow
2. Workflow SSHs to server and runs deployment script
3. Deployment script:
   - Fetches latest tags from GitHub
   - Identifies the latest semantic version tag
   - Checks out that version
   - Installs dependencies
   - Applies systemd configuration
   - Restarts the service
   - Logs the deployment with timestamp

### Manual Deployment

You can also trigger deployment manually:
- **GitHub Actions**: Go to "Deploy to Vultr VM" workflow → "Run workflow"
- **SSH to server**: Run `./deploy/deploy.sh` (deploys latest tag)

## Rollback Process

To rollback to the previous version:

```bash
# SSH into the server
ssh user@your-server

# Run the rollback script
cd /opt/ctools/deploy
./rollback.sh
```

The rollback script will:
1. Show current and previous versions
2. Ask for confirmation
3. Checkout the previous version
4. Reinstall dependencies
5. Restart the service
6. Log the rollback

## Version Display

The current deployed version is visible in:
- Web UI footer (bottom left)
- API endpoint: `GET /api/version`
- Deployment logs: `/opt/ctools/deploy/deployment-history.log`
- Version file: `/opt/ctools/.deployed_version`

## Files

- `deploy.sh` - Main deployment script
- `rollback.sh` - Rollback to previous version
- `version.sh` - Version management utilities
- `config.sh` - Deployment configuration
- `ctools.service` - Systemd service definition
- `deployment-history.log` - Deployment history (created on server)

## Semantic Versioning Guidelines

- **Major** (v2.0.0): Breaking changes or major new features
- **Minor** (v1.1.0): New features, backward compatible
- **Patch** (v1.0.1): Bug fixes, backward compatible

## Monitoring

Check deployment status:
```bash
# Service status
sudo systemctl status ctools

# Recent logs
sudo journalctl -u ctools -n 50 --no-pager

# Deployment history
cat /opt/ctools/deploy/deployment-history.log
```

## Workflows

### Create Release Workflow
- **Trigger**: Manual via GitHub Actions
- **Purpose**: Create version tags (major/minor/patch)
- **Actions**: Bumps version, creates tag, triggers deployment

### Deploy Workflow
- **Trigger**: Push version tag (v*.*.*)
- **Purpose**: Deploy latest tagged version to production
- **Actions**: SSH to server, run deployment script

## GitOps Principles

1. **Git as Single Source of Truth**: All deployment configuration lives in this repository
2. **Declarative Configuration**: `config.sh` and `ctools.service` define the desired state
3. **Tag-Based Deployment**: Only tagged versions are deployed (no direct master deploys)
4. **Automated Deployment**: Pushing tags triggers automatic deployment
5. **Version Control**: All changes are tracked and auditable
