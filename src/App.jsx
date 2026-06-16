import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
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
import StaffPending from './pages/StaffPending'
import StaffRegistry from './pages/StaffRegistry'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [staffPendingCount, setStaffPendingCount] = useState(0)

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
    if (userRole === 'manager') {
      fetchPendingCount()
      fetchStaffPendingCount()
    }
  }, [userRole])

  async function fetchPendingCount() {
    const { count } = await supabase
      .from('learners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    setPendingCount(count || 0)
  }

  async function fetchStaffPendingCount() {
    const { count } = await supabase
      .from('staff_registry')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    setStaffPendingCount(count || 0)
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
        <Route path="/" element={session ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/login" element={session ? <Navigate to="/app" replace /> : (
          <Login onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUserRole(session.user.user_metadata?.role || 'learner')
          })} />
        )} />
        <Route path="/register" element={
          !session ? <Navigate to="/login" replace /> :
          userRole === 'learner' ? <SelfRegister session={session} onLogout={handleLogout} /> :
          userRole === 'staff' ? <StaffSelfRegister session={session} onLogout={handleLogout} /> :
          <Navigate to="/app" replace />
        } />
        <Route path="/guides" element={!session ? <Navigate to="/login" replace /> : <GuidesPage />} />
        <Route path="/app/*" element={
          !session ? <Navigate to="/login" replace /> :
          (userRole === 'learner' || userRole === 'staff') ? <Navigate to="/register" replace /> :
          <ManagerLayout
            session={session}
            pendingCount={pendingCount}
            staffPendingCount={staffPendingCount}
            fetchPendingCount={fetchPendingCount}
            fetchStaffPendingCount={fetchStaffPendingCount}
            onLogout={handleLogout}
          />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function GuidesPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <button className="btn btn-secondary" style={{ marginBottom: '16px' }} onClick={() => navigate(-1)}>← Back</button>
        <Guides />
      </div>
    </div>
  )
}

function ManagerLayout({ session, pendingCount, staffPendingCount, fetchPendingCount, fetchStaffPendingCount, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const isActive = (path) => location.pathname === `/app/${path}` ? 'nav-btn active' : 'nav-btn'

  function goHome() {
    onLogout()
    navigate('/')
  }

  const navItems = [
    { label: '🏠 Home', onClick: goHome },
    { label: '📊 Dashboard', to: '/app/dashboard' },
    { label: '📋 Screener', to: '/app/screener' },
    { label: '👥 Learner Registry', to: '/app/registry' },
    { label: `⏳ Learner Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}`, to: '/app/pending', highlight: pendingCount > 0 },
    null, // divider
    { label: '🧑‍🏫 Staff Registry', to: '/app/staff-registry' },
    { label: `⏳ Staff Pending${staffPendingCount > 0 ? ` (${staffPendingCount})` : ''}`, to: '/app/staff-pending', highlight: staffPendingCount > 0 },
    null, // divider
    { label: '📖 Guides', to: '/app/guides' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* TOP HEADER — always visible */}
      <div style={{
        background: '#1a1a2e',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: '1px solid #2a2a4e',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/episafe_icon_512.png" alt="EpiSafe" style={{ width: '32px', height: '32px', borderRadius: '7px', objectFit: 'cover' }} />
          <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>EpiSafe School</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '4px 8px' }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '53px',
          left: 0,
          right: 0,
          background: '#1a1a2e',
          zIndex: 200,
          borderBottom: '2px solid #2a2a4e',
          padding: '8px 0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {navItems.map((item, i) => {
            if (!item) return <div key={i} style={{ height: '1px', background: '#2a2a4e', margin: '4px 12px' }} />
            if (item.onClick) return (
              <button key={i} onClick={() => { item.onClick(); setMenuOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#ccc', padding: '10px 20px', fontSize: '0.9375rem', cursor: 'pointer' }}>
                {item.label}
              </button>
            )
            return (
              <Link key={i} to={item.to}
                onClick={() => { setMenuOpen(false); if (item.label.includes('Pending')) { fetchPendingCount(); fetchStaffPendingCount() } }}
                style={{
                  display: 'block', padding: '10px 20px', fontSize: '0.9375rem', textDecoration: 'none',
                  color: item.highlight ? '#fa8c16' : location.pathname === item.to ? '#3ECF8E' : '#ccc',
                  background: location.pathname === item.to ? 'rgba(62,207,142,0.08)' : 'none',
                }}>
                {item.label}
              </Link>
            )
          })}
          <div style={{ padding: '10px 20px', borderTop: '1px solid #2a2a4e', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>👤 Manager · {session.user.email}</div>
            <button onClick={() => { onLogout(); setMenuOpen(false) }}
              style={{ background: 'none', border: 'none', color: '#ff4d4f', padding: '8px 0 0 0', cursor: 'pointer', fontSize: '0.875rem' }}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f0f4f8', padding: '16px' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="screener" element={<Screener />} />
          <Route path="registry" element={<Registry />} />
          <Route path="guides" element={<Guides />} />
          <Route path="pending" element={<Pending />} />
          <Route path="staff-registry" element={<StaffRegistry />} />
          <Route path="staff-pending" element={<StaffPending />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
