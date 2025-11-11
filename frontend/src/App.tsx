import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import LeadCard from './components/LeadCard'
import LeadTable from './components/LeadTable'
import { useLeadsPolling } from './hooks/useLeadsPolling'

function LeadsPage() {
  const [pollingEnabled, setPollingEnabled] = useState(true)
  
  const { 
    leads, 
    loading, 
    error, 
    refetch, 
    startPolling, 
    stopPolling 
  } = useLeadsPolling({
    pollingInterval: 5000,
    enabled: pollingEnabled,
  })

  const togglePolling = () => {
    if (pollingEnabled) {
      stopPolling()
      setPollingEnabled(false)
    } else {
      startPolling()
      setPollingEnabled(true)
    }
  }

  if (loading && leads.length === 0) {
    return (
      <div className="loading">
        <h2>Lade Daten...</h2>
        <p>Verbinde mit Backend...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h2>Fehler beim Laden der Daten</h2>
        <p><strong>Fehlermeldung:</strong> {error}</p>
        <button onClick={refetch}>Erneut versuchen</button>
        <div style={{ marginTop: '20px', textAlign: 'left', padding: '10px', background: '#f5f5f5' }}>
          <h3>Hilfe:</h3>
          <ul>
            <li>Prüfe ob das Backend läuft: <a href="http://localhost:8000/api/leads/" target="_blank" rel="noopener noreferrer">http://localhost:8000/api/leads/</a></li>
            <li>Öffne die Browser Console (F12) für Details</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="header">
        <h1>Lead Management (Live)</h1>
        <div className="controls">
          <button onClick={refetch}>Manuell aktualisieren</button>
          <button onClick={togglePolling}>
            Auto-Refresh: {pollingEnabled ? 'AN' : 'AUS'}
          </button>
          {/* {loading && <span className="spinner">🔄</span>} */}
          <span style={{ marginLeft: '10px', color: '#666' }}>
            {leads.length} Lead{leads.length !== 1 ? 's' : ''} geladen
          </span>
        </div>
      </div>
      <LeadTable leads={leads} />
    </div>
  )
}

function App() {
  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/' element={<LeadCard />} />
          <Route path='/leads' element={<LeadsPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
