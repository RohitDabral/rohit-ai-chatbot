# Multi-stage Dockerfile for FastAPI Backend

# Stage 1: Build dependencies
FROM python:3.10-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Minimal runtime image
FROM python:3.10-slim

WORKDIR /app

# Copy installed Python packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source code
COPY . /app

# Create directory for SQLite database with appropriate permissions
RUN mkdir -p /data && chmod 777 /data

ENV PYTHONUNBUFFERED=1
ENV LITELLM_LOCAL_MODEL_COST_MAP="True"
ENV DATABASE_URL="sqlite:////data/app.db"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
