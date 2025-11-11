import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import LeadCard from './components/LeadCard'
import LeadsPage from './pages/LeadsPage'



function App() {
  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/new' element={<LeadCard />} />
          <Route path='/' element={<LeadsPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
