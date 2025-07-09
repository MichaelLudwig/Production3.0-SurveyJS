#!/bin/bash

# Kill existing dev server
echo "Stopping existing dev server..."
pkill -f "vite.*5173" || true

# Wait a moment
sleep 2

# Build the app to ensure changes are compiled
echo "Building app..."
npm run build

# Start dev server in background
echo "Starting dev server..."
nohup npm run dev > dev.log 2>&1 &

# Wait for server to start
sleep 3

# Show server status
echo "Server status:"
lsof -i :5173 || echo "Server not yet ready"

echo "App available at: http://localhost:5173/"
echo "Log file: dev.log"