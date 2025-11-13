# Lead Scoring Engine

## 🎯 Projektbeschreibung

**Problem:** Sales-Teams haben keine klare Priorisierung bei eingehenden Leads. Welcher Lead ist am vielversprechendsten?

**Lösung:** Automatisches Lead-Scoring System, das Leads basierend auf Kriterien (Budget, Firmengröße, Industry, Urgency) bewertet und priorisiert.

**Spürbarer Nutzen:** 
- Sales-Mitarbeiter fokussieren sich auf die besten Leads
- Keine manuellen Priorisierungen mehr
- Datenbasierte Entscheidungen statt Bauchgefühl

---

## 🏗️ Architektur

```
┌─────────────────────────────────────┐
│  Frontend (React + Vite)            │
│  - Lead-Form mit Score-Preview      │
│  - Lead-Liste (sortiert nach Score) │
│  - Auto-Refresh (Polling)           │
│  - Port: 5173 (dev)                 │
└─────────────┬───────────────────────┘
              │ REST API Calls
              │ (http://localhost:8000)
              ↓
┌─────────────────────────────────────┐
│  Backend (Django REST Framework)    │
│  - Lead Model mit Scoring-Logik     │
│  - Multi-Tenancy Support            │
│  - REST API (CRUD)                  │
│  - Port: 8000                       │
└─────────────┬───────────────────────┘
              │ SQLite
              ↓
┌─────────────────────────────────────┐
│  SQLite Database                    │
│  - File: backend/db.sqlite3         │
│  - Tables: leads_lead, leads_tenant │
│  - Lokal, keine Installation nötig  │
└─────────────────────────────────────┘
```

**Lokales Development Setup:**
- SQLite für einfaches Setup ohne externe Dependencies
- Django Development Server (Port 8000)
- Vite Dev Server mit HMR (Port 5173)
- Automatisches Polling alle 10 Sekunden

---

## 💡 Scoring-Algorithmus

```python
Score = 
  + Budget Score (max 30 Punkte)
    - >50k €: 30 Punkte
    - >10k €: 20 Punkte
    - <10k €: 10 Punkte
  
  + Firmengröße Score (max 30 Punkte)
    - >500 MA: 30 Punkte
    - >100 MA: 20 Punkte
    - <100 MA: 10 Punkte
  
  + Industry Score (max 20 Punkte)
    - Tech: 20 Punkte
    - Finance: 15 Punkte
    - Healthcare: 10 Punkte
    - Other: 5 Punkte
  
  + Urgency Score (max 20 Punkte)
    - Sofort: 20 Punkte
    - Diese Woche: 15 Punkte
    - Diesen Monat: 10 Punkte
    - Später: 5 Punkte

= Max 100 Punkte
```

---

## 🗄️ Datenmodell

### Tenant Model
```python
class Tenant(models.Model):
    name = CharField(max_length=255)  # z.B. "Acme Corp"
    slug = SlugField(unique=True)
    created_at = DateTimeField(auto_now_add=True)
```

### Lead Model
```python
class Lead(models.Model):
    # Tenant Isolation
    tenant = ForeignKey(Tenant, on_delete=CASCADE)
    
    # Lead Daten
    first_name = CharField(max_length=100)
    last_name = CharField(max_length=100)
    email = EmailField()
    company = CharField(max_length=255)
    
    # Scoring-Kriterien
    budget = DecimalField()  # Erwarteter Deal-Wert
    company_size = IntegerField()  # Anzahl Mitarbeiter
    industry = CharField(choices=INDUSTRY_CHOICES)
    urgency = CharField(choices=URGENCY_CHOICES)
    
    # Berechneter Score
    score = IntegerField(default=0)  # 0-100
    
    # Metadata
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### Multi-Tenancy Isolation

**Konzept:** Jeder Lead gehört zu einem Tenant (Firma/Organisation). Die API filtert Leads automatisch basierend auf der Tenant-ID im Request-Header.

**Implementierung:**
- Middleware prüft Tenant-ID aus Request-Header (`X-Tenant-ID`)
- QuerySet-Filter: `Lead.objects.filter(tenant=request.tenant)`
- **Production:** User-Authentifizierung mit JWT würde sicherstellen, dass User nur Leads ihres eigenen Tenants sehen können
- **Zusätzlich:** Row-Level Security (PostgreSQL RLS) für DB-Level-Absicherung

---

## 🚀 Setup & Installation

### Voraussetzungen
- Python 3.11+
- Node.js 18+
- Git

### Quick Start (Empfohlen)

```bash
# 1. Repository klonen
git clone https://github.com/M1roel/coding-challenge-everlast.git
cd lead-scoring-engine

# 2. Backend Setup mit Automatik-Script
./setup.sh

# 3. Backend starten
cd backend
source venv/bin/activate  # Linux/Mac
python manage.py runserver 8000

# 4. Neues Terminal: Frontend starten
cd frontend
npm install
npm run dev
```

**Das war's! 🚀**
- Backend: http://localhost:8000/api/leads/
- Frontend: http://localhost:5173
- Admin Panel: http://localhost:8000/admin


## 🔧 Manuelle Installation (Alternative)

### Backend Setup

```bash
cd backend

# Virtual Environment erstellen
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Dependencies installieren
pip install -r requirements.txt

# Environment Variables setzen
cp .env.example .env
# .env editieren:
# DEBUG=True
# DATABASE_URL=sqlite:///db.sqlite3  # Für lokale Entwicklung

# Datenbank Migrations
python manage.py makemigrations
python manage.py migrate

# Superuser erstellen
python manage.py createsuperuser

# Test-Daten laden (optional)
python manage.py loaddata fixtures/test_data.json

# Server starten
python manage.py runserver 8000
```

**Backend läuft auf:** http://localhost:8000
**Admin Panel:** http://localhost:8000/admin

### Frontend Setup

```bash
cd frontend

# Dependencies installieren
npm install

# Environment Variables (optional)
cp .env.example .env
# Standard: VITE_API_URL=http://localhost:8000/api

# Development Server starten
npm run dev
```

**Frontend läuft auf:** http://localhost:5173

---

## 🐳 Production Deployment (Optional)

Die Anwendung kann auch mit Docker deployed werden. 
Siehe `FUTURE_IMPROVEMENTS.txt` für Deployment-Szenarien.

### Docker-Konfiguration verfügbar:
- `docker-compose.yml` - Development mit SQLite
- `docker-compose.prod.yml` - Production mit persistentem Volume
- `Dockerfile` - Backend Container Image

Deployment-Anleitung auf Anfrage.

---

## 📡 API Endpoints

### Base URL
- Development: `http://localhost:8000/api`

### Endpoints

#### Tenants
```
GET    /api/tenants/           - Liste aller Tenants
POST   /api/tenants/           - Tenant erstellen
GET    /api/tenants/{id}/      - Einzelner Tenant
PUT    /api/tenants/{id}/      - Tenant aktualisieren
DELETE /api/tenants/{id}/      - Tenant löschen
```

#### Leads
```
GET    /api/leads/             - Liste aller Leads (gefiltert nach Tenant)
POST   /api/leads/             - Lead erstellen (Score wird automatisch berechnet)
GET    /api/leads/{id}/        - Einzelner Lead
PUT    /api/leads/{id}/        - Lead aktualisieren (Score wird neu berechnet)
DELETE /api/leads/{id}/        - Lead löschen
GET    /api/leads/top/         - Top 10 Leads nach Score
```

### Request Beispiele

#### Lead erstellen
```bash
curl -X POST http://localhost:8000/api/leads/ \
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

#### Response
```json
{
  "id": 1,
  "first_name": "Max",
  "last_name": "Mustermann",
  "email": "max@example.com",
  "company": "Tech GmbH",
  "budget": "50000.00",
  "company_size": 250,
  "industry": "tech",
  "urgency": "this_week",
  "score": 85,
  "created_at": "2025-11-10T10:30:00Z",
  "tenant": 1
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test

# Mit Coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Test (manuell)
1. Backend starten: `python manage.py runserver 8000`
2. Frontend starten: `npm run dev`
3. Im Browser öffnen: `http://localhost:5173`
4. Lead anlegen → Score wird automatisch berechnet
5. Lead-Liste aktualisiert sich automatisch (Polling)
6. Leads mit Score ≥ 70 werden hervorgehoben

---

## ⚖️ Technische Trade-offs

### Entscheidungen & Begründungen

#### 1. **SQLite für Development**
- **Gewählt:** SQLite als Standard-Datenbank
- **Pro:** Keine Installation nötig, schnelles Setup, ausreichend für < 100k Leads
- **Con:** Nicht für Multi-Server-Szenarien geeignet
- **Alternative:** PostgreSQL für Production mit höherer Last

#### 2. **Scoring-Berechnung im Backend vs Frontend**
- **Gewählt:** Backend (in Model.save())
- **Pro:** Single Source of Truth, konsistent, nicht manipulierbar
- **Con:** Kein Client-seitiges Preview
- **Alternative:** Scoring-Logik in separaten Service auslagern

#### 3. **Multi-Tenancy: Application-Level**
- **Gewählt:** Application-Level (Django QuerySet Filter)
- **Pro:** Einfach zu implementieren, portabel, gut für MVP
- **Con:** Nicht auf DB-Level abgesichert
- **Next Step:** Row-Level Security für Production

#### 4. **Tenant-ID aus Header vs URL vs Session**
- **Gewählt:** Request Header (`X-Tenant-ID`)
- **Pro:** Clean URLs, API-freundlich
- **Con:** Muss manuell gesetzt werden
- **Alternative:** JWT Token mit Tenant-Claim

#### 5. **Scoring-Formel: Statisch vs ML-basiert**
- **Gewählt:** Statische Regel-basierte Formel
- **Pro:** Transparent, nachvollziehbar, kein Training nötig
- **Con:** Nicht lernfähig
- **Next Step:** ML-Model für adaptive Scoring

#### 6. **Frontend State Management: useState**
- **Gewählt:** React useState + Custom Hooks
- **Pro:** Einfach, ausreichend für MVP, kein Overhead
- **Con:** Bei sehr großer App schwierig zu skalieren
- **Next Step:** Context API oder Zustand bei Bedarf

#### 7. **Polling vs WebSockets**
- **Gewählt:** HTTP Polling (10 Sekunden Intervall)
- **Pro:** Einfach, funktioniert überall, kein persistente Connection
- **Con:** Höhere Server-Last als WebSockets
- **Next Step:** WebSockets für Real-Time Updates

---

## 🔄 Future Improvements

Siehe `FUTURE_IMPROVEMENTS.txt` für eine Liste geplanter Features und Verbesserungen.

**Highlights:**
- Dynamischer Score-Filter im Frontend
- Lead bearbeiten/löschen Funktionalität
- Sortierbare Tabellen-Spalten
- CSV-Export
- Production Deployment auf Linux Server

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **Django 5.0+** - Web Framework
- **Django REST Framework** - REST API
- **SQLite** - Datenbank (Development)
- **Gunicorn** - WSGI Server (Production)

### Frontend
- **React 18+** - UI Library
- **Vite** - Build Tool & Dev Server
- **TypeScript** - Type Safety
- **React Router** - Client-side Routing

### Development
- **Git** - Version Control
- **ESLint** - Code Linting
- **Python venv** - Virtual Environment

---

## 📁 Projektstruktur

```
lead-scoring-engine/
├── backend/
│   ├── config/                 # Django Settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── leads/                  # Main App
│   │   ├── models.py           # Lead, Tenant Models
│   │   ├── serializers.py      # DRF Serializers
│   │   ├── views.py            # API Views
│   │   ├── scoring.py          # Scoring Logic
│   │   └── middleware.py       # Tenant Middleware
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── LeadCard.tsx    # Lead Form
│   │   │   └── LeadTable.tsx   # Lead List
│   │   ├── pages/              # Page Components
│   │   │   └── LeadsPage.tsx
│   │   ├── hooks/              # Custom Hooks
│   │   │   └── useLeadsPolling.ts
│   │   ├── types/              # TypeScript Types
│   │   │   └── lead.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
│
├── setup.sh                    # Automatisches Backend Setup
├── docker-compose.yml          # Optional: Docker Setup
├── FUTURE_IMPROVEMENTS.txt     # Geplante Features
├── .gitignore
└── README.md
```

---

## 🤝 Contribution Guidelines

1. Fork das Repository
2. Feature Branch erstellen: `git checkout -b feature/amazing-feature`
3. Changes committen: `git commit -m 'Add amazing feature'`
4. Branch pushen: `git push origin feature/amazing-feature`
5. Pull Request öffnen

---

## 📝 License

MIT License - siehe [LICENSE](LICENSE) für Details

---

## 👤 Autor

**Peter Pfautsch**
- GitHub: [@M1roel](https://github.com/M1roel)
- LinkedIn: [Peter Pfautsch](https://linkedin.com/in/peter-pfautsch)

---

## 🙏 Acknowledgments

- Coding Challenge von Everlast
- Django & Django REST Framework Documentation
- React & Vite Documentation

---

## 📞 Support

Bei Fragen oder Problemen:
- Issue öffnen: [GitHub Issues](https://github.com/M1roel/coding-challenge-everlast/issues)
- Email: kontakt@peterpfautsch.de

---

**Erstellt für:** Coding Challenge - Sales Lead Scoring System  
**Entwicklungszeit:** 2-3 Tage  
**Status:** MVP Ready ✅
