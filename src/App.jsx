import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Registry from './pages/Registry'
import Screener from './pages/Screener'
import Guides from './pages/Guides'
import SelfRegister from './pages/SelfRegister'
import StaffSelfRegister from './pages/StaffSelfRegister'
import Pending from './pages/Pending'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setUserRole(session.user.user_metadata?.role || 'learner')
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setUserRole(session.user.user_metadata?.role || 'learner')
      else setUserRole(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (userRole === 'manager') fetchPendingCount()
  }, [userRole])

  async function fetchPendingCount() {
    const { count } = await supabase
      .from('learners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    setPendingCount(count || 0)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setUserRole(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px', color: '#888' }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          session ? <Navigate to="/app" replace /> : <Landing />
        } />

        <Route path="/login" element={
          session ? <Navigate to="/app" replace /> : (
            <Login onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => {
              setSession(session)
              setUserRole(session.user.user_metadata?.role || 'learner')
            })} />
          )
        } />

        <Route path="/register" element={
          !session ? <Navigate to="/login" replace /> :
          userRole === 'learner' ? <SelfRegister session={session} onLogout={handleLogout} /> :
          userRole === 'staff' ? <StaffSelfRegister session={session} onLogout={handleLogout} /> :
          <Navigate to="/app" replace />
        } />

        <Route path="/app/*" element={
          !session ? <Navigate to="/login" replace /> :
          (userRole === 'learner' || userRole === 'staff') ? <Navigate to="/register" replace /> :
          <ManagerLayout
            session={session}
            pendingCount={pendingCount}
            fetchPendingCount={fetchPendingCount}
            onLogout={handleLogout}
          />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function ManagerLayout({ session, pendingCount, fetchPendingCount, onLogout }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === `/app/${path}` ? 'nav-btn active' : 'nav-btn'

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">EpiSafe School</span>
        </div>
        <nav>
          <Link className={isActive('dashboard')} to="/app/dashboard">📊 Dashboard</Link>
          <Link className={isActive('screener')} to="/app/screener">📋 Screener</Link>
          <Link className={isActive('registry')} to="/app/registry">👥 Registry</Link>
          <Link className={isActive('guides')} to="/app/guides">📖 Guides</Link>
          <Link
            className={isActive('pending')}
            to="/app/pending"
            onClick={fetchPendingCount}
            style={{ color: pendingCount > 0 ? '#fa8c16' : '' }}
          >
            ⏳ Pending {pendingCount > 0 ? `(${pendingCount})` : ''}
          </Link>
        </nav>
        <div style={{ marginTop: 'auto', padding: '20px 12px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', paddingLeft: '4px' }}>👤 Manager</div>
          <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px', paddingLeft: '4px' }}>{session.user.email}</div>
          <button className="nav-btn" style={{ color: '#ff4d4f', width: '100%' }} onClick={onLogout}>🚪 Logout</button>
        </div>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="screener" element={<Screener />} />
          <Route path="registry" element={<Registry />} />
          <Route path="guides" element={<Guides />} />
          <Route path="pending" element={<Pending />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App