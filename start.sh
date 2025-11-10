#!/bin/bash

echo "========================================"
echo " PDF Scanner - Student Management System"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting server..."
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

node src/server.js

