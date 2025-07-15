#!/bin/bash

echo "🚀 Starting Production 3.0 Backend..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo ""
fi

# Start the backend
echo "🎯 Starting backend server on http://localhost:3001"
echo "Press Ctrl+C to stop"
echo ""

npm run dev