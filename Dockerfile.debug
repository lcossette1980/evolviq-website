# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy everything first
COPY . /tmp/build

# Debug: List what's actually in the build context
RUN echo "=== Contents of /tmp/build ===" && \
    ls -la /tmp/build && \
    echo "=== Contents of /tmp/build/src ===" && \
    ls -la /tmp/build/src/ || echo "src directory not found" && \
    echo "=== Looking for requirements.txt ===" && \
    find /tmp/build -name "requirements.txt" -type f

# Copy requirements and install dependencies
RUN if [ -f /tmp/build/src/api/requirements.txt ]; then \
        cp /tmp/build/src/api/requirements.txt ./requirements.txt; \
    else \
        echo "requirements.txt not found at expected location"; \
        exit 1; \
    fi && \
    pip install --no-cache-dir -r requirements.txt

# Copy API code to working directory
RUN cp -r /tmp/build/src/api/* . && \
    rm -rf /tmp/build

# Expose port
EXPOSE 8000

# Command to run the application  
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}