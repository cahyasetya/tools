#!/bin/bash
# GitOps Deployment Configuration
# This file defines the desired state of the deployment

# Application settings
export APP_NAME="ctools"
export APP_DIR="/opt/ctools"
export APP_USER="root"
export APP_PORT="5001"

# Git settings
export GIT_BRANCH="master"

# Python settings
export PYTHON_VERSION="python3"
export VENV_DIR="venv"

# Service settings
export SERVICE_NAME="ctools"
export SYSTEMD_SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
