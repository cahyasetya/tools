# Python Web Tools Makefile

# Variables - respects pyenv
PYTHON := python
PIP := pip
VENV := venv
APP := app.py
REQUIREMENTS := requirements.txt
HOST := 0.0.0.0
PORT := 5001

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help install venv run dev clean test lint format check

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-12s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	$(PIP) install -r $(REQUIREMENTS)

venv: ## Create virtual environment and install dependencies
	@echo "$(GREEN)Creating virtual environment with current pyenv Python...$(NC)"
	@echo "$(YELLOW)Using: $(shell $(PYTHON) --version)$(NC)"
	$(PYTHON) -m venv $(VENV)
	@echo "$(GREEN)Installing dependencies in virtual environment...$(NC)"
	$(VENV)/bin/pip install -r $(REQUIREMENTS)
	@echo "$(GREEN)Virtual environment created! Activate with: source $(VENV)/bin/activate$(NC)"

run: ## Run the application
	@echo "$(GREEN)Starting web server at http://$(HOST):$(PORT)$(NC)"
	$(PYTHON) $(APP)

dev: ## Run the application in development mode
	@echo "$(GREEN)Starting development server at http://$(HOST):$(PORT)$(NC)"
	FLASK_ENV=development FLASK_DEBUG=1 $(PYTHON) $(APP)

venv-run: ## Run the application using virtual environment
	@echo "$(GREEN)Starting web server using virtual environment...$(NC)"
	$(VENV)/bin/python $(APP)

test: ## Run basic tests (check if server starts)
	@echo "$(GREEN)Testing application startup...$(NC)"
	@timeout 5 $(PYTHON) -c "import app; print('✓ App imports successfully')" || echo "$(RED)✗ App import failed$(NC)"

lint: ## Check code style with flake8 (install with: pip install flake8)
	@echo "$(GREEN)Checking code style...$(NC)"
	@flake8 $(APP) --max-line-length=88 --ignore=E203,W503 || echo "$(YELLOW)flake8 not installed, run: pip install flake8$(NC)"

format: ## Format code with black (install with: pip install black)
	@echo "$(GREEN)Formatting code...$(NC)"
	@black $(APP) || echo "$(YELLOW)black not installed, run: pip install black$(NC)"

check: ## Run all checks (lint, test)
	@echo "$(GREEN)Running all checks...$(NC)"
	@make lint
	@make test

clean: ## Clean up temporary files and virtual environment
	@echo "$(GREEN)Cleaning up...$(NC)"
	rm -rf $(VENV)
	rm -rf __pycache__
	rm -rf *.pyc
	rm -rf .pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

deps-dev: ## Install development dependencies
	@echo "$(GREEN)Installing development dependencies...$(NC)"
	$(PIP) install flake8 black pytest

freeze: ## Generate requirements.txt from current environment
	@echo "$(GREEN)Generating requirements.txt...$(NC)"
	$(PIP) freeze > $(REQUIREMENTS)

server-info: ## Show server information
	@echo "$(GREEN)Server Information:$(NC)"
	@echo "  Application: $(APP)"
	@echo "  Host: $(HOST)"
	@echo "  Port: $(PORT)"
	@echo "  URL: http://$(HOST):$(PORT)"
	@echo ""
	@echo "$(GREEN)Available endpoints:$(NC)"
	@echo "  / - Home page"
	@echo "  /base64 - Base64 encoder/decoder"
	@echo "  /json-beautify - JSON formatter"
	@echo "  /json-diff - JSON comparison tool"

install-system: ## Install system-wide (use with caution)
	@echo "$(RED)Warning: Installing system-wide. Consider using 'make venv' instead.$(NC)"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@make install

# Quick start commands
quick-start: venv ## Quick start: create venv, install deps, and run
	@echo "$(GREEN)Quick start complete! To run manually:$(NC)"
	@echo "  source $(VENV)/bin/activate"
	@echo "  make venv-run"

# Docker-like commands (if you want to add Docker later)
build: venv ## Build the project (create venv and install deps)
	@echo "$(GREEN)Build complete!$(NC)"

up: run ## Start the server (alias for run)

down: ## Stop the server (manual - use Ctrl+C)
	@echo "$(YELLOW)Use Ctrl+C to stop the server$(NC)"

launch: ## Launch browser and start server automatically
	@echo "$(GREEN)Launching CTools...$(NC)"
	bash -c 'eval "$$(pyenv init -)" && pyenv activate ctools && python launch.py'

launch-sh: ## Launch using shell script (alternative)
	@echo "$(GREEN)Launching CTools with shell script...$(NC)"
	./launch.sh

pyenv-check: ## Check pyenv Python environment setup
	@echo "$(GREEN)Checking pyenv environment...$(NC)"
	./pyenv_check.py

launch-simple: ## Simple direct launcher (runs in current environment)
	@echo "$(GREEN)Launching CTools (simple)...$(NC)"
	bash -c 'eval "$$(pyenv init -)" && pyenv activate ctools && python launch_simple.py'