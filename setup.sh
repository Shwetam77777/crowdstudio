#!/bin/bash
# CrowdStudio Setup Script for Linux/Mac

echo "🎵 CrowdStudio Setup Script"
echo "============================="
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if command -v node &> /dev/null
then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js is installed: $NODE_VERSION"
else
    echo "✗ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Backend Setup
echo ""
echo "Setting up Backend..."
cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_change_in_production_12345"
JWT_EXPIRY="7d"
CORS_ORIGIN="http://localhost:3000"
EOF
    echo "✓ Created .env file"
else
    echo "✓ .env file already exists"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install
echo "✓ Backend dependencies installed"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate dev --name updated_schema
npx prisma generate
echo "✓ Database migrations completed"

# Return to root
cd ..

# Frontend Setup
echo ""
echo "Setting up Frontend..."
cd frontend-web

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_BASE=http://localhost:4000
EOF
    echo "✓ Created .env.local file"
else
    echo "✓ .env.local file already exists"
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install
echo "✓ Frontend dependencies installed"

# Return to root
cd ..

# Done
echo ""
echo "============================="
echo "✓ Setup Complete!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend-web"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "For more details, see SETUP_GUIDE.md"
echo ""
