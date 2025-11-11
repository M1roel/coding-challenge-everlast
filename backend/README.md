# Lead Scoring Engine - Backend

Django REST API Backend für die Lead Scoring Engine mit Multi-Tenancy Support.

## 🚀 Quick Start (Lokale Entwicklung)

### Option 1: Automatisches Setup (empfohlen)

```bash
# Im Hauptverzeichnis ausführen
./setup.sh
```

Das Script:
- Erstellt ein Virtual Environment
- Installiert alle Dependencies
- Erstellt die .env Datei
- Führt Database Migrations aus
- Optional: Erstellt einen Superuser

### Option 2: Manuelle Installation

```bash
cd backend

# Virtual Environment erstellen
python3 -m venv venv
source venv/bin/activate

# Dependencies installieren
pip install -r requirements.txt

# Environment Variables
cp .env.example .env
# .env nach Bedarf anpassen

# Database Migrations
python manage.py makemigrations
python manage.py migrate

# Superuser erstellen
python manage.py createsuperuser

# Testdaten laden (optional)
python manage.py loaddata fixtures/test_data.json

# Development Server starten
python manage.py runserver 8001
```

## 🌐 API Endpoints

Base URL (Development): `http://localhost:8001/api/`

### Tenants
- `GET    /api/tenants/` - Liste aller Tenants
- `POST   /api/tenants/` - Tenant erstellen
- `GET    /api/tenants/{id}/` - Einzelner Tenant
- `PUT    /api/tenants/{id}/` - Tenant aktualisieren
- `DELETE /api/tenants/{id}/` - Tenant löschen

### Leads
- `GET    /api/leads/` - Liste aller Leads
- `POST   /api/leads/` - Lead erstellen
- `GET    /api/leads/{id}/` - Einzelner Lead
- `PUT    /api/leads/{id}/` - Lead aktualisieren
- `DELETE /api/leads/{id}/` - Lead löschen
- `GET    /api/leads/top/` - Top Leads nach Score
- `GET    /api/leads/stats/` - Statistiken

### Headers
Für Multi-Tenancy Support:
```
X-Tenant-ID: 1
```

## 🧪 API Testing

### Tenant erstellen
```bash
curl -X POST http://localhost:8001/api/tenants/ \
  -H "Content-Type: application/json" \
  -d '{"name": "My Company"}'
```

### Lead erstellen
```bash
curl -X POST http://localhost:8001/api/leads/ \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 1" \
  -d '{
    "first_name": "Max",
    "last_name": "Mustermann",
    "email": "max@example.com",
    "company": "Tech GmbH",
    "budget": 50000,
    "company_size": 250,
    "industry": "tech",
    "urgency": "this_week"
  }'
```

### Top Leads abrufen
```bash
curl http://localhost:8001/api/leads/top/?limit=5 \
  -H "X-Tenant-ID: 1"
```

## 🗄️ Datenbank

### Lokale Entwicklung (SQLite)
Standardmäßig wird SQLite verwendet - keine weitere Konfiguration nötig.

### Production (PostgreSQL/Supabase)
In `.env`:
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/DATABASE
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up
```

### Production (mit Supabase)
```bash
# .env.production anpassen
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Migrations ausführen
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Superuser erstellen
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## 📊 Scoring Algorithmus

Der Lead Score wird automatisch beim Speichern berechnet:

**Budget** (max 30 Punkte):
- ≥ 50.000€: 30 Punkte
- ≥ 10.000€: 20 Punkte
- < 10.000€: 10 Punkte

**Company Size** (max 30 Punkte):
- ≥ 500 MA: 30 Punkte
- ≥ 100 MA: 20 Punkte
- < 100 MA: 10 Punkte

**Industry** (max 20 Punkte):
- Tech: 20 Punkte
- Finance: 15 Punkte
- Healthcare: 10 Punkte
- Other: 5 Punkte

**Urgency** (max 20 Punkte):
- Immediately: 20 Punkte
- This Week: 15 Punkte
- This Month: 10 Punkte
- Later: 5 Punkte

**Total: 0-100 Punkte**

## 🔧 Django Admin

Admin Panel: `http://localhost:8001/admin/`

Hier können Tenants und Leads über eine Web-UI verwaltet werden.

## 📝 Entwicklung

### Neue Migration erstellen
```bash
python manage.py makemigrations
python manage.py migrate
```

### Tests ausführen
```bash
python manage.py test
```

### Shell öffnen
```bash
python manage.py shell
```

## 🔐 Security

**Wichtig für Production:**
1. `SECRET_KEY` in `.env` ändern
2. `DEBUG=False` setzen
3. `ALLOWED_HOSTS` korrekt konfigurieren
4. Starke Passwörter für DB verwenden
5. HTTPS verwenden

## 📦 Dependencies

- Django 5.0+
- Django REST Framework
- PostgreSQL/psycopg2
- django-cors-headers
- python-dotenv
- gunicorn (Production)

## 🤝 Support

Bei Fragen oder Problemen, siehe Hauptprojekt README.
