import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const MANAGER_SECRET = 'EPISAFE2025'
const staffTypes = ['Teacher', 'Support Staff', 'Attendants', 'Administrative Staff']

const schoolsByZone = {
  'Zone 1': ['Adolphe de Plevitz SSS','James Burty David SSS','Droopnath Ramphul State College','Frank Richard SSS','Goodlands SSS','Lady Sushil Ramgoolam SSS','Pailles SSS','Pamplemousses SSS','Piton SC','Port Louis North SSS','Port Louis SSS','G. M. Dawjee Atchia State College','Prof. Hassan Raffa SSS','Rabindranath Tagore SSS','Ramsoondur Prayag SSS','R. Seeneevassen SSS','Riviere du Rempart SSS','Royal College Port Louis','Sharma Jugdambi SSS','Shri Beekrumsingh Ramlallah SSS','Sir A. R. Mohamed SSS','Terre Rouge SSS','Triolet SSS','Alpha College','Bhujoharry College','BPS Fatima College','Bradley College','College Ideal','College Pere Laval','Cosmopolitain College','DAV HSC College','DAV College','Labourdonnais College','Friendship College (Boys)','Friendship College (Girls)','International College','Islamic Cultural College','Islamic Cultural Form VI College','London College','Loreto College Port Louis','Madad Ul Islam Girls College','Merton College','Muslim Girls College','Pamplemousses High School','Port Louis High School','S Munrakhun College',"Saint Bartholomew's College",'Universal College'],
  'Zone 2': ['Beau Bassin SSS','Bel Air Riviere Seche SSS','Bon Accueil State College','Camp de Masque State College','Ebene SSS (Boys)','Ebene SSS (Girls)','John Kennedy College','Mahatma Gandhi Institute','Mahatma Gandhi SS Centre de Flacq','Mahatma Gandhi SS Moka','Manilall Doctor SSS','Marcel Cabon SSS','Quartier Militaire SSS','Queen Elizabeth College','Rajcoomar Gujadhur SSS','Sebastopol SSS','Shrimati Indira Gandhi SSS','Sir Leckraz Teelock SSS','Byron College','La Confiance College','College des Ville Soeurs','Loreto College Rose Hill','Rose Hill Muslim College','Royal College Curepipe','Royal College Beau Bassin',"St Andrew's College",'St Joseph College',"St Mary's College",'Vieux Grand Port SSS','Sodnac SSS'],
  'Zone 3': ['Curepipe College','Bel Ombre SSS','Chemin Grenier SSS','Henrietta SSS','Mahebourg SSS',"Mare d'Albert SSS",'New Eben Ezer SSS','Phoenix SSS','Plaine Magnien SSS','Riviere des Anguilles State College','Rose Belle SSS','Sookdeo Bissoondoyal State College','Stanley College','Surinam SSS','Tyack SSS','Wooton SSS','Loreto College Curepipe','St Gabriel College','St Esprit College','Sodnac College','Nouvelle France College','Savanne College','Grand Bois College'],
  'Zone 4': ['Bambous SSS','Cascades SSS','Ecole du Centre SSS','Floreal SSS','Forest Side SSS','Quatre Bornes SSS','Royal College Rose Hill','Vacoas SSS','Highlands College','Belle Rose SSS','Tamarin SSS','Black River SSS','Flic en Flac SSS','Petite Riviere SSS','Dr Regis Chaperon SSS','Loreto College Quatre Bornes','St Andrews College','Clavis College','Savannah College'],
}

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('learner')
  const [staffType, setStaffType] = useState('')
  const [managerCode, setManagerCode] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [school, setSchool] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const schoolList = selectedZone ? schoolsByZone[selectedZone] : []

  async function handleSubmit() {
    if (!email || !password) return setError('Please enter email and password')
    if (isSignUp && role === 'staff' && !staffType) return setError('Please select your staff type')
    if (isSignUp && role === 'manager' && managerCode !== MANAGER_SECRET) {
      return setError('Invalid manager code. Please contact your administrator.')
    }
    if (isSignUp && role === 'manager' && (!selectedZone || !school)) {
      return setError('Please select your zone and school')
    }
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            staff_type: role === 'staff' ? staffType : null,
            zone: role === 'manager' ? selectedZone : null,
            school: role === 'manager' ? school : null,
          }
        }
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
    setSelectedZone('')
    setSchool('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <button onClick={() => navigate('/')} style={{ position: 'fixed', top: '16px', left: '16px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8125rem', color: '#666', cursor: 'pointer', zIndex: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        🏠 Home
      </button>

      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '12px' }}>
            <img src="/episafe_icon_512.png" alt="EpiSafe School" style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 4px 16px rgba(150,80,220,0.35)' }} />
          </div>
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
              <>
                <div className="form-group">
                  <label>Manager Secret Code</label>
                  <input type="password" value={managerCode} onChange={e => setManagerCode(e.target.value)} placeholder="Enter secret code provided by administrator" />
                  <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '-8px' }}>Contact your school administrator for this code.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                  <div className="form-group">
                    <label>Zone</label>
                    <select value={selectedZone} onChange={e => { setSelectedZone(e.target.value); setSchool('') }}>
                      <option value="">-- Select zone --</option>
                      <option value="Zone 1">Zone 1 — Port Louis & North</option>
                      <option value="Zone 2">Zone 2 — East & Central</option>
                      <option value="Zone 3">Zone 3 — South & South East</option>
                      <option value="Zone 4">Zone 4 — West & Highlands</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>School</label>
                    <select value={school} onChange={e => setSchool(e.target.value)} disabled={!selectedZone}>
                      <option value="">{selectedZone ? '-- Select school --' : '-- Select zone first --'}</option>
                      {schoolList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </>
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
