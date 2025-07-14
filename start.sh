#!/bin/bash

# Get port from environment variable or default to 8000
PORT=${PORT:-8000}

echo "🚀 Starting EvolvIQ Linear Regression API on port $PORT"

# Start uvicorn with the correct port
exec uvicorn main:app --host 0.0.0.0 --port $PORT