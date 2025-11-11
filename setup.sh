#!/bin/bash

# Lead Scoring Engine - Backend Setup Script

echo "🚀 Setting up Lead Scoring Engine Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo "📥 Installing dependencies..."
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration!"
else
    echo "✅ .env file already exists"
fi

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
echo ""
echo "👤 Do you want to create a superuser? (y/n)"
read -r create_superuser
if [ "$create_superuser" = "y" ]; then
    python manage.py createsuperuser
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver 8001"
echo ""
echo "The API will be available at: http://localhost:8001/api/"
echo "The admin panel will be available at: http://localhost:8001/admin/"
echo ""
