# Simple Dockerfile with API files in root
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy API files
COPY main.py .
COPY regression/ ./regression/
COPY ml_frameworks/ ./ml_frameworks/
COPY start.sh .

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["./start.sh"]