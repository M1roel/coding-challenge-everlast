# Lead Data Subscription - Dokumentation

## Übersicht

Die App nutzt **Polling** für automatische Live-Updates der Lead-Daten aus der SQLite-Datenbank.

### ✅ Aktuelle Implementierung: **Polling mit Auto-Refresh**
- Automatische Aktualisierung alle 10 Sekunden
- Start/Stop Kontrolle mit Toggle-Button
- Manuelles Refresh jederzeit möglich
- Echtzeit-Updates ohne WebSockets

## Schnellstart

```bash
# Backend starten
cd backend
python manage.py runserver

# Frontend starten
cd frontend
npm run dev

# Öffne im Browser
# http://localhost:5173/leads
```

## Hooks

### `useLeads` Hook

```typescript
import { useLeads } from './hooks/useLeads'

function MyComponent() {
  const { leads, loading, error, refetch } = useLeads({
    autoFetch: true,
    search: 'John',
    minScore: 50,
    industry: 'Tech',
    tenantId: '1'
  })

  // Verwende leads, loading, error...
}
```

**Optionen:**
- `autoFetch`: Boolean - Automatisch beim Mount laden (default: true)
- `search`: String - Suche nach Name, Email oder Firma
- `industry`: String - Filter nach Branche
- `urgency`: String - Filter nach Dringlichkeit
- `minScore`: Number - Minimale Punktzahl
- `tenantId`: String - Tenant ID für Multi-Tenancy

### `useLeadsPolling` Hook

```typescript
import { useLeadsPolling } from './hooks/useLeadsPolling'

function MyComponent() {
  const { 
    leads, 
    loading, 
    error, 
    refetch,
    startPolling,
    stopPolling 
  } = useLeadsPolling({
    pollingInterval: 5000, // 5 Sekunden
    enabled: true,
    minScore: 50
  })

  // Polling kontrollieren
  const handleToggle = () => {
    if (enabled) {
      stopPolling()
    } else {
      startPolling()
    }
  }
}
```

**Zusätzliche Optionen:**
- `pollingInterval`: Number - Interval in Millisekunden (default: 5000)
- `enabled`: Boolean - Polling aktiviert (default: true)

## API Endpunkte

Das Backend bietet folgende Endpunkte:

### Leads

```
GET    /api/leads/          - Alle Leads abrufen
GET    /api/leads/{id}/     - Einzelnen Lead abrufen
POST   /api/leads/          - Neuen Lead erstellen
PUT    /api/leads/{id}/     - Lead aktualisieren
DELETE /api/leads/{id}/     - Lead löschen
GET    /api/leads/top/      - Top Leads nach Score
GET    /api/leads/stats/    - Statistiken
```

### Query Parameter

```
?search=John              - Suche nach Name, Email, Firma
?industry=Tech           - Filter nach Branche
?urgency=urgent          - Filter nach Dringlichkeit
?min_score=70           - Minimale Punktzahl
?limit=10               - Anzahl der Ergebnisse (für /top/)
```

### Headers

```
X-Tenant-ID: 1          - Optional: Tenant ID für Multi-Tenancy
```

## Konfiguration

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_TENANT_ID=1  # Optional
```

### CORS (Backend)

Stelle sicher, dass in `backend/config/settings.py` CORS korrekt konfiguriert ist:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative
]
```

## Fehlerbehandlung

Alle Implementierungen enthalten:
- ✅ Loading States
- ✅ Error Handling
- ✅ Retry Mechanismen
- ✅ Type Safety (TypeScript)

## Performance Tipps

1. **Polling Interval anpassen**: Nicht zu aggressiv (nicht unter 2 Sekunden)
2. **Filter verwenden**: Reduziert Datenmenge
3. **Pagination**: Für große Datenmengen (TODO)
4. **Caching**: Browser cached automatisch GET Requests

## Alternative: WebSockets

Für echte Echtzeit-Updates kannst du Django Channels mit WebSockets verwenden:

```bash
# Backend
pip install channels channels-redis
pip install daphne

# Dann Django Channels konfigurieren
```

**Polling vs WebSockets:**
- Polling: Einfacher, funktioniert überall
- WebSockets: Effizienter, komplexer Setup

Für die meisten Use Cases reicht Polling vollkommen aus!

## Nächste Schritte

- [ ] Pagination implementieren
- [ ] Sortierung hinzufügen
- [ ] Filter UI erstellen
- [ ] WebSocket Integration (optional)
- [ ] Optimistic Updates bei Änderungen
