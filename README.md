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
│  Frontend (React)                   │
│  - Lead-Form                        │
│  - Lead-Liste (sortiert nach Score) │
│  - Dashboard: Top Leads             │
│  - Port: 3000 (dev) / 3002 (prod)   │
└─────────────┬───────────────────────┘
              │ REST API Calls
              ↓
┌─────────────────────────────────────┐
│  Backend (Django REST Framework)    │
│  - Lead Model mit Scoring-Logik     │
│  - Multi-Tenancy (tenant_id)        │
│  - REST Endpoints (CRUD)            │
│  - Docker Container                 │
│  - Port: 8001                       │
└─────────────┬───────────────────────┘
              │ PostgreSQL Connection
              ↓
┌─────────────────────────────────────┐
│  Supabase PostgreSQL                │
│  - Schema: lead_scoring             │
│  - Tables: leads_lead, leads_tenant │
│  - Existierender Docker Container   │
│  - Port: 5432 (intern)              │
└─────────────────────────────────────┘
```

### Docker-Netzwerk:
```
Linux V-Server
│
├── supabase_network (Docker Network)
│   ├── Supabase PostgreSQL Container
│   ├── Django Backend Container (neu)
│   └── Weitere Supabase Services
│
└── Node.js Weather App (bestehendes Projekt)
```

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

**Konzept:** Jeder Lead gehört zu einem Tenant (Firma/Organisation). User sehen nur Leads ihres Tenants.

**Implementierung:**
- Middleware prüft Tenant-ID aus Request-Header
- QuerySet-Filter: `Lead.objects.filter(tenant=request.tenant)`
- Row-Level Security in PostgreSQL (optional)

---

## 🚀 Setup & Installation

### Voraussetzungen
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Zugriff auf Linux V-Server mit Supabase

### 1. Repository klonen
```bash
git clone https://github.com/username/lead-scoring-engine.git
cd lead-scoring-engine
```

### 2. Backend Setup (Lokal entwickeln)

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
python manage.py runserver
```

**Backend läuft auf:** http://localhost:8000
**Admin Panel:** http://localhost:8000/admin

### 3. Frontend Setup

```bash
cd frontend

# Dependencies installieren
npm install

# Environment Variables
cp .env.example .env
# .env editieren:
# REACT_APP_API_URL=http://localhost:8000/api

# Development Server starten
npm start
```

**Frontend läuft auf:** http://localhost:3000

### 4. Production Deployment (Docker auf V-Server)

#### A. Supabase Connection Details finden

```bash
# SSH auf deinen Server
ssh user@your-server.com

# Supabase Container-Name finden
docker ps | grep postgres
# z.B. "supabase-db" oder "supabase_db_1"

# Docker-Netzwerk finden
docker network ls
# z.B. "supabase_default"
```

#### B. Backend für Production vorbereiten

```bash
# backend/.env.production
DEBUG=False
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@supabase-db:5432/postgres
ALLOWED_HOSTS=your-server.com,localhost
SECRET_KEY=your-secret-key-here
```

#### C. Docker Build & Deploy

```bash
# Projekt auf Server übertragen
git clone https://github.com/username/lead-scoring-engine.git
cd lead-scoring-engine

# Environment Variables setzen
cp backend/.env.production backend/.env

# Docker Build
docker-compose -f docker-compose.prod.yml build

# Container starten
docker-compose -f docker-compose.prod.yml up -d

# Migrations in Production ausführen
docker-compose exec backend python manage.py migrate

# Static Files sammeln
docker-compose exec backend python manage.py collectstatic --noinput
```

#### D. PostgreSQL Schema erstellen (einmalig)

```bash
# In Supabase Container
docker exec -it supabase-db psql -U postgres

# SQL ausführen:
CREATE SCHEMA IF NOT EXISTS lead_scoring;
GRANT ALL ON SCHEMA lead_scoring TO postgres;
```

---

## 📡 API Endpoints

### Base URL
- Development: `http://localhost:8000/api`
- Production: `http://your-server.com:8001/api`

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
1. Backend starten: `python manage.py runserver`
2. Frontend starten: `npm start`
3. Im Browser öffnen: `http://localhost:3000`
4. Lead anlegen → Score sollte automatisch berechnet werden
5. Lead-Liste aktualisiert sich
6. Sortierung nach Score funktioniert

---

## ⚖️ Technische Trade-offs

### Entscheidungen & Begründungen

#### 1. **SQLite (Dev) vs PostgreSQL (Prod)**
- **Gewählt:** Beide unterstützen
- **Pro:** Schnelle lokale Entwicklung, production-ready Database
- **Con:** Kleine Unterschiede in SQL-Features
- **Mitigation:** Django ORM abstrahiert meiste Unterschiede

#### 2. **Scoring-Berechnung im Backend vs Frontend**
- **Gewählt:** Backend (in Model.save())
- **Pro:** Single Source of Truth, konsistent, nicht manipulierbar
- **Con:** Kein Client-seitiges Preview
- **Alternative:** Scoring-Logik in separaten Service auslagern

#### 3. **Multi-Tenancy: Row-Level Security vs Application-Level**
- **Gewählt:** Application-Level (Django QuerySet Filter)
- **Pro:** Einfacher zu implementieren, portabel
- **Con:** Nicht auf DB-Level abgesichert
- **Next Step:** PostgreSQL Row-Level Security hinzufügen

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

#### 6. **Frontend State Management: useState vs Redux**
- **Gewählt:** React useState + Context API
- **Pro:** Einfach, ausreichend für MVP
- **Con:** Bei großer App schwierig zu skalieren
- **Next Step:** Bei Wachstum auf Zustand oder Redux umstellen

#### 7. **Docker: Separate Container vs Docker Compose**
- **Gewählt:** Docker Compose mit shared Network
- **Pro:** Einfaches Setup, Service-Discovery
- **Con:** Alle Services müssen zusammen starten
- **Alternative:** Kubernetes für Production-Scale

---

## 🔄 Next Steps / Roadmap

### Phase 1: MVP Erweiterungen
- [ ] Lead Status Tracking (New → Contacted → Qualified → Won/Lost)
- [ ] Lead-Notizen/Kommentare
- [ ] Lead-Aktivitäts-Historie
- [ ] Email-Benachrichtigungen bei High-Score Leads

### Phase 2: Features
- [ ] Dashboard mit Metriken (Conversion Rate, Avg. Score, etc.)
- [ ] Export als CSV/PDF
- [ ] Bulk-Import von Leads
- [ ] Lead-Zuweisung an Sales-Mitarbeiter

### Phase 3: Optimierungen
- [ ] Machine Learning für adaptive Scoring
- [ ] A/B Testing verschiedener Scoring-Formeln
- [ ] PostgreSQL Row-Level Security
- [ ] Caching (Redis) für Performance
- [ ] Real-time Updates (WebSockets)

### Phase 4: Enterprise Features
- [ ] SSO/SAML Integration
- [ ] Audit Logs
- [ ] Custom Scoring-Formeln per Tenant
- [ ] API Rate Limiting
- [ ] Monitoring & Alerting (Prometheus/Grafana)

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **Django 5.0+** - Web Framework
- **Django REST Framework** - API
- **PostgreSQL 15+** - Datenbank (via Supabase)
- **Gunicorn** - WSGI Server
- **Docker** - Containerization

### Frontend
- **React 18+** - UI Framework
- **Axios** - HTTP Client
- **React Router** - Navigation
- **Tailwind CSS** - Styling (optional)

### Infrastructure
- **Docker & Docker Compose** - Deployment
- **Nginx** - Reverse Proxy (optional)
- **Supabase** - PostgreSQL Hosting
- **Linux V-Server** - Hosting

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
│   │   │   ├── LeadForm.jsx
│   │   │   ├── LeadList.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/           # API Calls
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── docker-compose.prod.yml
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
- GitHub: [@username](https://github.com/M1roel)
- LinkedIn: [Dein Profil](https://linkedin.com/in/peter-pfautsch)

---

## 🙏 Acknowledgments

- Challenge von [Everlast]
- Django Documentation
- React Documentation
- Supabase für PostgreSQL Hosting

---

## 📞 Support

Bei Fragen oder Problemen:
- Issue öffnen: [GitHub Issues](https://github.com/M1roel/lead-scoring-engine/issues)
- Email: kontakt@peterpfautsch.de

---

**Erstellt für:** Coding Challenge - Sales CRM/ERP Context
**Entwicklungszeit:** 2-3 Tage
**Status:** MVP Completed ✅
