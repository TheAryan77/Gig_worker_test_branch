#!/bin/bash

# TrustHire WebSocket Server Setup Script
echo "🚀 Setting up TrustHire WebSocket Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Please edit .env and configure:"
    echo "   - PORT (default: 5000)"
    echo "   - ALLOWED_ORIGINS (add your frontend URL)"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

echo "✨ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Run 'npm start' for production"
echo ""
echo "🌐 Default server address: http://localhost:5000"
echo ""
