.PHONY: up down build logs test clean

# Start the full stack with Docker Compose
up:
	docker compose up --build -d

# Stop and clean containers
down:
	docker compose down

# Build container images
build:
	docker compose build

# Follow logs from both containers
logs:
	docker compose logs -f

# Run backend pytest suite
test:
	python -m pytest backend/tests/test_api.py -v

# Clean generated data files
clean:
	docker compose down -v
	rm -rf backend/data/*.db backend/.pytest_cache frontend/dist frontend/node_modules
