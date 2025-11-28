#!/bin/bash

echo "🚀 TrustHire Backend Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys:"
    echo "   - GEMINI_API_KEY"
    echo "   - RAZORPAY_KEY_ID"
    echo "   - RAZORPAY_KEY_SECRET"
    echo "   - FIREBASE_PROJECT_ID"
    echo "   - FIREBASE_CLIENT_EMAIL"
    echo "   - FIREBASE_PRIVATE_KEY"
    echo ""
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your credentials"
echo "2. Run: npm run dev"
echo "3. Backend will start at http://localhost:4000"
echo ""
echo "📚 See README.md and API_DOCS.md for more info"
