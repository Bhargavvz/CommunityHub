#!/bin/bash

# Simple script to start the backend in development mode

echo "Starting Residential Community Hub Backend in development mode..."
echo "----------------------------------------"

# Change to the backend directory (in case script is called from elsewhere)
cd "$(dirname "$0")/.." || exit 1

# Check if .env exists
if [ ! -f .env ]; then
  echo "Warning: .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "Please update .env with your configuration settings."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo "node_modules not found. Installing dependencies..."
  npm install
fi

# Start the server
echo "Starting server..."
npm run dev 