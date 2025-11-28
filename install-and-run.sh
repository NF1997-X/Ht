#!/bin/bash

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm --prefix /workspaces/Ht/backend install /workspaces/Ht/backend

# Initialize database
echo "🗄️ Initializing database..."
node /workspaces/Ht/backend/initDb.js

# Start backend server
echo "🚀 Starting backend server..."
node /workspaces/Ht/backend/server.js
