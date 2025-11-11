#!/bin/bash

echo "🚀 Deploying Lead Scoring Backend with SQLite..."

# 1. Repository aktualisieren (falls auf Server)
# git pull origin main

# 2. Docker Image neu bauen
echo "🐳 Building Docker image..."
docker-compose -f docker-compose.prod.yml build

# 3. Container stoppen und entfernen
echo "🛑 Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

# 4. Container starten
echo "▶️  Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# 5. Logs anzeigen
echo "📋 Container logs (Ctrl+C to exit):"
docker-compose -f docker-compose.prod.yml logs -f backend

echo "✅ Deployment complete!"
echo "📍 Backend läuft auf: http://localhost:8001"
echo "📊 Check status: docker-compose -f docker-compose.prod.yml ps"
echo "📝 View logs: docker-compose -f docker-compose.prod.yml logs -f"
