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
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [schoolId, setSchoolId] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [staffPendingCount, setStaffPendingCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const role = session.user.user_metadata?.role || 'learner'
        setUserRole(role)
        if (role === 'manager') await fetchSchoolId(session.user.id)
      }
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        const role = session.user.user_metadata?.role || 'learner'
        setUserRole(role)
        if (role === 'manager') await fetchSchoolId(session.user.id)
      } else {
        setUserRole(null)
        setSchoolId(null)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchSchoolId(userId) {
    const { data } = await supabase.from('schools').select('id').eq('manager_id', userId).single()
    if (data) setSchoolId(data.id)
  }

  useEffect(() => {
    if (userRole === 'manager' && schoolId) {
      fetchPendingCount()
      fetchStaffPendingCount()
    }
  }, [userRole, schoolId])

  async function fetchPendingCount() {
    const { count } = await supabase.from('learners').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('school_id', schoolId)
    setPendingCount(count || 0)
  }

  async function fetchStaffPendingCount() {
    const { count } = await supabase.from('staff_registry').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('school_id', schoolId)
    setStaffPendingCount(count || 0)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setUserRole(null)
    setSchoolId(null)
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
          <Login onLogin={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            const role = session.user.user_metadata?.role || 'learner'
            setUserRole(role)
            if (role === 'manager') await fetchSchoolId(session.user.id)
          }} />
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
          userRole === 'admin' ? <AdminLayout session={session} onLogout={handleLogout} /> :
          <ManagerLayout
            session={session}
            schoolId={schoolId}
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

function AdminLayout({ session, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function goHome() { onLogout(); navigate('/') }

  const navItems = [
    { label: '🏠 Home', onClick: goHome },
    { label: '📊 Admin Dashboard', to: '/app/admin' },
    { label: '🏫 All Schools', to: '/app/schools' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ background: '#1a0a2e', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #3a1a5e', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/episafe_icon_512.png" alt="EpiSafe" style={{ width: '32px', height: '32px', borderRadius: '7px', objectFit: 'cover' }} />
          <div>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>EpiSafe School</span>
            <span style={{ marginLeft: '8px', background: '#5B21B6', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.05em' }}>ADMIN</span>
          </div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '4px 8px' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div style={{ position: 'absolute', top: '53px', left: 0, right: 0, background: '#1a0a2e', zIndex: 200, borderBottom: '2px solid #3a1a5e', padding: '8px 0', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {navItems.map((item, i) => item.onClick ? (
            <button key={i} onClick={() => { item.onClick(); setMenuOpen(false) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#ccc', padding: '10px 20px', fontSize: '0.9375rem', cursor: 'pointer' }}>
              {item.label}
            </button>
          ) : (
            <Link key={i} to={item.to} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 20px', fontSize: '0.9375rem', textDecoration: 'none', color: location.pathname === item.to ? '#a78bfa' : '#ccc', background: location.pathname === item.to ? 'rgba(167,139,250,0.1)' : 'none' }}>
              {item.label}
            </Link>
          ))}
          <div style={{ padding: '10px 20px', borderTop: '1px solid #3a1a5e', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>👑 Admin · {session.user.email}</div>
            <button onClick={() => { onLogout(); setMenuOpen(false) }}
              style={{ background: 'none', border: 'none', color: '#ff4d4f', padding: '8px 0 0 0', cursor: 'pointer', fontSize: '0.875rem' }}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', background: '#f0f4f8', padding: '16px' }}>
        <Routes>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="schools" element={<AdminDashboard tab="schools" />} />
          <Route path="*" element={<Navigate to="admin" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function ManagerLayout({ session, schoolId, pendingCount, staffPendingCount, fetchPendingCount, fetchStaffPendingCount, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const isActive = (path) => location.pathname === `/app/${path}`

  function goHome() { onLogout(); navigate('/') }

  const navItems = [
    { label: '🏠 Home', onClick: goHome },
    { label: '📊 Dashboard', to: '/app/dashboard' },
    { label: '📋 Screener', to: '/app/screener' },
    { label: '👥 Learner Registry', to: '/app/registry' },
    { label: `⏳ Learner Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}`, to: '/app/pending', highlight: pendingCount > 0 },
    null,
    { label: '🧑‍🏫 Staff Registry', to: '/app/staff-registry' },
    { label: `⏳ Staff Pending${staffPendingCount > 0 ? ` (${staffPendingCount})` : ''}`, to: '/app/staff-pending', highlight: staffPendingCount > 0 },
    null,
    { label: '📖 Guides', to: '/app/guides' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ background: '#1a1a2e', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #2a2a4e', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/episafe_icon_512.png" alt="EpiSafe" style={{ width: '32px', height: '32px', borderRadius: '7px', objectFit: 'cover' }} />
          <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>EpiSafe School</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '4px 8px' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div style={{ position: 'absolute', top: '53px', left: 0, right: 0, background: '#1a1a2e', zIndex: 200, borderBottom: '2px solid #2a2a4e', padding: '8px 0', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
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
                style={{ display: 'block', padding: '10px 20px', fontSize: '0.9375rem', textDecoration: 'none', color: item.highlight ? '#fa8c16' : isActive(item.to.replace('/app/', '')) ? '#3ECF8E' : '#ccc', background: isActive(item.to.replace('/app/', '')) ? 'rgba(62,207,142,0.08)' : 'none' }}>
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

      <div style={{ flex: 1, overflowY: 'auto', background: '#f0f4f8', padding: '16px' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard schoolId={schoolId} />} />
          <Route path="screener" element={<Screener schoolId={schoolId} />} />
          <Route path="registry" element={<Registry schoolId={schoolId} />} />
          <Route path="guides" element={<Guides />} />
          <Route path="pending" element={<Pending schoolId={schoolId} />} />
          <Route path="staff-registry" element={<StaffRegistry schoolId={schoolId} />} />
          <Route path="staff-pending" element={<StaffPending schoolId={schoolId} />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
