# Test Dockerfile to debug Railway build context
FROM python:3.11-slim

WORKDIR /app

# Copy everything and debug
COPY . .

# List what we actually have
RUN echo "=== Root directory contents ===" && \
    ls -la && \
    echo "=== Looking for api directory ===" && \
    ls -la api/ || echo "api directory not found" && \
    echo "=== Looking for requirements.txt ===" && \
    find . -name "requirements.txt" -type f

# If api directory exists, install and run
RUN if [ -d "api" ]; then \
        cd api && \
        pip install -r requirements.txt; \
    else \
        echo "API directory not found, exiting"; \
        exit 1; \
    fi

WORKDIR /app/api

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]