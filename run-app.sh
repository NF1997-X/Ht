#!/bin/bash

echo "🚀 Starting Gallery App..."
echo ""

# Check if .env exists
if [ ! -f "/workspaces/Ht/backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "Please create backend/.env with your DATABASE_URL"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "/workspaces/Ht/backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd /workspaces/Ht/backend
    npm install
    echo ""
fi

# Initialize database if needed
echo "🗄️ Initializing database tables..."
cd /workspaces/Ht/backend
npm run init-db
echo ""

# Start backend server in background
echo "🚀 Starting backend server on port 3000..."
cd /workspaces/Ht/backend
npm start &
BACKEND_PID=$!
echo "Backend server started (PID: $BACKEND_PID)"
echo ""

# Wait for server to be ready
echo "⏳ Waiting for backend server to be ready..."
sleep 3

# Check if server is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend server is running!"
else
    echo "⚠️  Backend server might not be ready yet. Waiting a bit more..."
    sleep 2
fi

echo ""
echo "✅ App is running!"
echo ""
echo "📍 Backend API: http://localhost:3000/api"
echo "📍 Frontend: Open index.html in your browser or run:"
echo "   python3 -m http.server 8000"
echo ""
echo "To stop the backend server, run:"
echo "   kill $BACKEND_PID"
echo ""
