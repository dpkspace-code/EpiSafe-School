import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Registry from './pages/Registry'
import Screener from './pages/Screener'
import Guides from './pages/Guides'
import './App.css'

function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">EpiSafe School</span>
        </div>
        <nav>
          <button className={page === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('dashboard')}>📊 Dashboard</button>
          <button className={page === 'screener' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('screener')}>📋 Screener</button>
          <button className={page === 'registry' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('registry')}>👥 Registry</button>
          <button className={page === 'guides' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('guides')}>📖 Guides</button>
        </nav>
      </div>
      <div className="main-content">
        {page === 'dashboard' && <Dashboard setPage={setPage} />}
        {page === 'screener' && <Screener />}
        {page === 'registry' && <Registry />}
        {page === 'guides' && <Guides />}
      </div>
    </div>
  )
}

export default App