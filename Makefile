.PHONY: help install dev build test lint format clean docker-up docker-down docker-logs seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm install
	cd backend && npm install
	cd shared && npm install

dev: ## Start development server (WhatsApp Bot)
	npm run dev

build: ## Build all projects
	npm run build

test: ## Run all tests
	npm run test

lint: ## Lint all code
	npm run lint

format: ## Format all code
	npm run format

clean: ## Clean all build artifacts and dependencies
	rm -rf node_modules backend/node_modules shared/node_modules
	rm -rf backend/dist shared/dist
	rm -rf backend/coverage

docker-up: ## Start Docker containers
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

docker-build: ## Build Docker images
	docker compose build

docker-restart: ## Restart Docker containers
	docker compose restart

seed: ## Seed database with sample data
	cd backend && npm run prisma:seed

migrate: ## Run database migrations
	cd backend && npm run prisma:migrate

studio: ## Open Prisma Studio
	cd backend && npm run prisma:studio

quickstart: ## Quick start with Docker
	./scripts/quickstart.sh
