# GitOps Deployment

This directory contains GitOps configuration for deploying ctools.

## GitOps Principles Applied

1. **Git as Single Source of Truth**: All deployment configuration lives in this repository
2. **Declarative Configuration**: `config.sh` and `ctools.service` define the desired state
3. **Automated Deployment**: Push to `master` triggers automatic deployment
4. **Version Control**: All changes are tracked and auditable

## Files

- `ctools.service` - Systemd service configuration (declarative)
- `config.sh` - Deployment environment configuration
- `deploy.sh` - GitOps deployment script that applies desired state

## How It Works

1. **Push to master** → Triggers GitHub Actions
2. **GitHub Actions** → SSHs to server and runs `deploy/deploy.sh`
3. **deploy.sh** → Pulls latest code and applies configuration:
   - Updates systemd service from `deploy/ctools.service`
   - Installs dependencies from `requirements.txt`
   - Restarts service
   - Verifies deployment

## Manual Deployment

SSH to server and run:
```bash
cd /opt/ctools
./deploy/deploy.sh
```

## Configuration Changes

To change deployment configuration:
1. Edit `deploy/config.sh` or `deploy/ctools.service`
2. Commit and push to master
3. Deployment automatically applies the new configuration

## Benefits

- All configuration is version-controlled
- Easy rollback (just revert git commit)
- Consistent deployments
- Audit trail of all changes
- No manual steps on server
