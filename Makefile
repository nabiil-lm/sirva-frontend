.PHONY: help install dev build start lint typecheck format clean docker-build docker-up docker-down

help:
	@echo "SIRVA Frontend - Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make start        - Start production server"
	@echo "  make lint         - Run ESLint"
	@echo "  make typecheck    - Run TypeScript type checking"
	@echo "  make format       - Format code with Prettier"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm start

lint:
	npm run lint

typecheck:
	npm run typecheck

format:
	npm run format

clean:
	rm -rf .next node_modules package-lock.json

docker-build:
	docker build -t sirva-frontend:latest .

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down
