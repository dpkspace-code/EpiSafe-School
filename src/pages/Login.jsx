import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const MANAGER_SECRET = 'EPISAFE2025'
const staffTypes = ['Teacher', 'Support Staff', 'Attendants', 'Administrative Staff']

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('learner')
  const [staffType, setStaffType] = useState('')
  const [managerCode, setManagerCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email || !password) return setError('Please enter email and password')
    if (isSignUp && role === 'staff' && !staffType) return setError('Please select your staff type')
    if (isSignUp && role === 'manager' && managerCode !== MANAGER_SECRET) {
      return setError('Invalid manager code. Please contact your administrator.')
    }
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, staff_type: role === 'staff' ? staffType : null } }
      })
      if (error) setError(error.message)
      else setError('Account created! You can now log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onLogin()
    }
    setLoading(false)
  }

  function selectRole(newRole) {
    setRole(newRole)
    setStaffType('')
    setManagerCode('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <button onClick={() => navigate('/')} style={{ position: 'fixed', top: '16px', left: '16px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8125rem', color: '#666', cursor: 'pointer', zIndex: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        🏠 Home
      </button>

      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧠</div>
          <h1 style={{ fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '6px' }}>EpiSafe School</h1>
          <p style={{ color: '#888', fontSize: '0.875rem', textTransform: 'uppercase' }}>Epilepsy management for Mauritian schools</p>
        </div>

        <div style={{ marginBottom: '20px', background: '#f0f4f8', borderRadius: '8px', padding: '4px', display: 'flex' }}>
          <button onClick={() => setIsSignUp(false)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: !isSignUp ? 'white' : 'transparent', color: !isSignUp ? '#1a1a2e' : '#888', fontWeight: !isSignUp ? '500' : '400', boxShadow: !isSignUp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Login</button>
          <button onClick={() => setIsSignUp(true)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: isSignUp ? 'white' : 'transparent', color: isSignUp ? '#1a1a2e' : '#888', fontWeight: isSignUp ? '500' : '400', boxShadow: isSignUp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Create Account</button>
        </div>

        {isSignUp && (
          <div className="form-group">
            <label>I am a</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <button onClick={() => selectRole('learner')} style={{ flex: 1, padding: '10px', border: role === 'learner' ? '2px solid #3ECF8E' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: role === 'learner' ? '#e6fff5' : 'white', color: role === 'learner' ? '#0F6E56' : '#666', fontWeight: role === 'learner' ? '500' : '400' }}>
                🎒 Learner
              </button>
              <button onClick={() => selectRole('staff')} style={{ flex: 1, padding: '10px', border: role === 'staff' ? '2px solid #3ECF8E' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: role === 'staff' ? '#e6fff5' : 'white', color: role === 'staff' ? '#0F6E56' : '#666', fontWeight: role === 'staff' ? '500' : '400' }}>
                🧑‍🏫 Staff
              </button>
              <button onClick={() => selectRole('manager')} style={{ flex: 1, padding: '10px', border: role === 'manager' ? '2px solid #3ECF8E' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: role === 'manager' ? '#e6fff5' : 'white', color: role === 'manager' ? '#0F6E56' : '#666', fontWeight: role === 'manager' ? '500' : '400' }}>
                🏫 Manager
              </button>
            </div>

            {role === 'staff' && (
              <div className="form-group">
                <label>Staff Type</label>
                <select value={staffType} onChange={e => setStaffType(e.target.value)}>
                  <option value="">-- Select staff type --</option>
                  {staffTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            {role === 'manager' && (
              <div className="form-group">
                <label>Manager Secret Code</label>
                <input type="password" value={managerCode} onChange={e => setManagerCode(e.target.value)} placeholder="Enter secret code provided by administrator" />
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '-8px' }}>Contact your school administrator for this code.</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', background: error.includes('created') ? '#e6fff5' : '#fff1f0', color: error.includes('created') ? '#0F6E56' : '#ff4d4f', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.9375rem' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#aaa' }}>
          EpiSafe — Supporting epilepsy awareness in Mauritius
        </p>
      </div>
    </div>
  )
}

export default Login