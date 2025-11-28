#!/bin/bash

echo "🐳 TrustHire Docker Setup"
echo "=========================="
echo ""

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

echo "📝 Checking environment files..."

if [ ! -f "./frontend/.env.local" ]; then
    echo "⚠️  Warning: frontend/.env.local not found"
    echo "   Create it with:"
    echo "   NEXT_PUBLIC_BACKEND_URL=http://localhost:4000"
    echo "   NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:5000"
    echo ""
fi

if [ ! -f "./backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found"
    echo "   Copy from backend/.env.example and configure"
    echo ""
fi

if [ ! -f "./websocket-server/.env" ]; then
    echo "⚠️  Warning: websocket-server/.env not found"
    echo "   Copy from websocket-server/.env.example and configure"
    echo ""
fi

echo "🏗️  Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   docker-compose up"
echo ""
echo "🚀 To start in detached mode:"
echo "   docker-compose up -d"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose down"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🔍 To view specific service logs:"
echo "   docker-compose logs -f frontend"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f websocket"
echo ""
