#!/bin/bash

echo "🚀 Setting up Gallery App with Neon Database..."

# Navigate to backend
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize database
echo "🗄️ Initializing database..."
npm run init-db

# Start server
echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "  cd backend"
echo "  npm start"
echo ""
echo "Then open index.html in your browser or run:"
echo "  python3 -m http.server 8000"
