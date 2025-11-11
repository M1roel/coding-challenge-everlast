import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import '../src/components/LeadCard'
import LeadCard from '../src/components/LeadCard'

function App() {

  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/' element={<LeadCard />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
