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

# Copy requirements and install dependencies
RUN cp /tmp/build/src/api/requirements.txt ./requirements.txt && \
    pip install --no-cache-dir -r requirements.txt

# Copy API code to working directory
RUN cp -r /tmp/build/src/api/* . && \
    rm -rf /tmp/build

# Expose port
EXPOSE 8000

# Command to run the application  
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}