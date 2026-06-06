import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Registry from './pages/Registry'
import Screener from './pages/Screener'
import Guides from './pages/Guides'
import SelfRegister from './pages/SelfRegister'
import './App.css'

function App() {
  const [page, setPage] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        setUserRole(session.user.user_metadata?.role || 'learner')
        setShowLanding(false)
      }
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setUserRole(session.user.user_metadata?.role || 'learner')
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setUserRole(null)
    setShowLanding(true)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px', color: '#888' }}>
      Loading...
    </div>
  )

  if (showLanding && !session) return <Landing onEnter={() => setShowLanding(false)} />

  if (!session) return <Login onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setUserRole(session.user.user_metadata?.role || 'learner') })} />

  if (userRole === 'learner') return <SelfRegister session={session} onLogout={handleLogout} />

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
        <div style={{ marginTop: 'auto', padding: '20px 12px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', paddingLeft: '4px' }}>👤 Manager</div>
          <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px', paddingLeft: '4px' }}>{session.user.email}</div>
          <button className="nav-btn" style={{ color: '#ff4d4f', width: '100%' }} onClick={handleLogout}>🚪 Logout</button>
        </div>
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