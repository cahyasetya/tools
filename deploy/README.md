# Deployment and Versioning Guide

## Overview

This project uses GitOps deployment with semantic versioning. The deployment system automatically deploys the latest git tag to the production server.

## Versioning Strategy

- **Version Format**: Semantic Versioning (v1.0.0, v1.1.0, v2.0.0)
- **Deployment Target**: Latest git tag
- **Rollback**: Quick rollback to previous version

## Creating a New Release

1. **Make your changes** and commit them to master
2. **Create a version tag**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Trigger deployment**:
   - Push to master or run workflow manually
   - The system will automatically deploy the latest tag

## Deployment Process

The deployment follows these steps:

1. Fetch latest tags from GitHub
2. Identify the latest semantic version tag
3. Checkout that version
4. Install dependencies
5. Apply systemd configuration
6. Restart the service
7. Log the deployment with timestamp

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

## GitOps Principles

1. **Git as Single Source of Truth**: All deployment configuration lives in this repository
2. **Declarative Configuration**: `config.sh` and `ctools.service` define the desired state
3. **Automated Deployment**: Push to `master` triggers automatic deployment
4. **Version Control**: All changes are tracked and auditable
