import { useState } from 'react'
import { supabase } from '../supabase'

const seizureTypes = [
  { value: 'Tonic-clonic (Grand mal)', desc: 'Body stiffens then jerks — I may fall and lose consciousness' },
  { value: 'Absence', desc: 'I have brief blank stares and appear unresponsive for a few seconds' },
  { value: 'Focal (Partial)', desc: 'Affects one part of my body, I may stay conscious but feel confused' },
  { value: 'Atonic (Drop attack)', desc: 'I suddenly lose muscle tone and fall without warning' },
  { value: 'Myoclonic', desc: 'I have sudden brief muscle jerks, often in my arms' },
  { value: 'Unknown / Not yet diagnosed', desc: 'My seizure type has not been confirmed by a doctor yet' },
]

const medications = [
  'Sodium Valproate (Epilim)',
  'Carbamazepine (Tegretol)',
  'Lamotrigine (Lamictal)',
  'Levetiracetam (Keppra)',
  'Phenobarbitone',
  'Clonazepam (Rivotril)',
  'Multiple medications',
  'No medication',
  'Unknown',
]

const triggerOptions = [
  'Stress and anxiety',
  'Sleep deprivation',
  'Flashing or flickering lights',
  'Missed medication',
  'Fever or illness',
  'Dehydration or skipped meals',
  'Overheating or physical exhaustion',
  'Hormonal changes',
  'Multiple triggers',
  'Unknown triggers',
]

const actionSteps = [
  'Stay calm and stay with me',
  'Note the time my seizure starts',
  'Clear area of hard or sharp objects',
  'Cushion my head gently',
  'Do NOT restrain me',
  'Place me in recovery position after convulsions stop',
  'Call my emergency contact if seizure exceeds 5 minutes',
  'Call 114 (ambulance) if first seizure or no recovery',
  'Reassure me when I regain awareness',
  'Record duration and type of movements',
]

const grades = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','Grade 13']

const schoolsByZone = {
  'Zone 1': ['Adolphe de Plevitz SSS','James Burty David SSS','Droopnath Ramphul State College','Frank Richard SSS','Goodlands SSS','Lady Sushil Ramgoolam SSS','Pailles SSS','Pamplemousses SSS','Piton SC','Port Louis North SSS','Port Louis SSS','G. M. Dawjee Atchia State College','Prof. Hassan Raffa SSS','Rabindranath Tagore SSS','Ramsoondur Prayag SSS','R. Seeneevassen SSS','Riviere du Rempart SSS','Royal College Port Louis','Sharma Jugdambi SSS','Shri Beekrumsingh Ramlallah SSS','Sir A. R. Mohamed SSS','Terre Rouge SSS','Triolet SSS','Alpha College','Bhujoharry College','BPS Fatima College','Bradley College','College Ideal','College Pere Laval','Cosmopolitain College','DAV HSC College','DAV College','Labourdonnais College','Friendship College (Boys)','Friendship College (Girls)','International College','Islamic Cultural College','Islamic Cultural Form VI College','London College','Loreto College Port Louis','Madad Ul Islam Girls College','Merton College','Muslim Girls College','Pamplemousses High School','Port Louis High School','S Munrakhun College',"Saint Bartholomew's College",'Universal College'],
  'Zone 2': ['Beau Bassin SSS','Bel Air Riviere Seche SSS','Bon Accueil State College','Camp de Masque State College','Ebene SSS (Boys)','Ebene SSS (Girls)','John Kennedy College','Mahatma Gandhi Institute','Mahatma Gandhi SS Centre de Flacq','Mahatma Gandhi SS Moka','Manilall Doctor SSS','Marcel Cabon SSS','Quartier Militaire SSS','Queen Elizabeth College','Rajcoomar Gujadhur SSS','Sebastopol SSS','Shrimati Indira Gandhi SSS','Sir Leckraz Teelock SSS','Byron College','La Confiance College','College des Ville Soeurs','Loreto College Rose Hill','Rose Hill Muslim College','Royal College Curepipe','Royal College Beau Bassin',"St Andrew's College",'St Joseph College',"St Mary's College",'Vieux Grand Port SSS','Sodnac SSS'],
  'Zone 3': ['Curepipe College','Bel Ombre SSS','Chemin Grenier SSS','Henrietta SSS','Mahebourg SSS',"Mare d'Albert SSS",'New Eben Ezer SSS','Phoenix SSS','Plaine Magnien SSS','Riviere des Anguilles State College','Rose Belle SSS','Sookdeo Bissoondoyal State College','Stanley College','Surinam SSS','Tyack SSS','Wooton SSS','Loreto College Curepipe','St Gabriel College','St Esprit College','Sodnac College','Nouvelle France College','Savanne College','Grand Bois College'],
  'Zone 4': ['Bambous SSS','Cascades SSS','Ecole du Centre SSS','Floreal SSS','Forest Side SSS','Quatre Bornes SSS','Royal College Rose Hill','Vacoas SSS','Highlands College','Belle Rose SSS','Tamarin SSS','Black River SSS','Flic en Flac SSS','Petite Riviere SSS','Dr Regis Chaperon SSS','Loreto College Quatre Bornes','St Andrews College','Clavis College','Savannah College'],
}

function SelfRegister({ session, onLogout }) {
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedActions, setSelectedActions] = useState([...actionSteps])
  const [form, setForm] = useState({
    full_name: '', grade: '', class: '', seizure_type: '',
    medication: '', triggers: '', emergency_contact_name: '',
    emergency_contact_phone: '', action_plan: '', status: 'pending'
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedSeizure = seizureTypes.find(s => s.value === form.seizure_type)
  const schoolList = selectedZone ? schoolsByZone[selectedZone] : []

  function toggleAction(step) {
    setSelectedActions(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    )
  }

  async function handleSubmit() {
    if (!form.full_name) return setError('Please enter your full name')
    if (!form.grade) return setError('Please select your grade')
    setSaving(true)
    const finalForm = { ...form, action_plan: selectedActions.join(' | ') }
    const { error } = await supabase.from('learners').insert([finalForm])
    if (error) setError('Error: ' + error.message)
    else setSubmitted(true)
    setSaving(false)
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '480px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: '#1a1a2e', marginBottom: '12px' }}>Registration Submitted!</h2>
        <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '24px' }}>Thank you for registering. Your information has been securely submitted to the school health team. A staff member will follow up with you shortly.</p>
        <button className="btn btn-primary" onClick={onLogout}>Done</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', padding: '30px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px' }}>🧠</div>
          <h1 style={{ color: '#1a1a2e', fontSize: '22px', marginBottom: '6px' }}>EpiSafe — Learner Registration</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Your information is confidential and will only be seen by school health staff</p>
        </div>

        {error && <div style={{ background: '#fff1f0', color: '#ff4d4f', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Personal Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grade *</label>
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                <option value="">-- Select grade --</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Zone</label>
              <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                <option value="">-- Select zone --</option>
                <option value="Zone 1">Zone 1 — Port Louis & North</option>
                <option value="Zone 2">Zone 2 — East & Central</option>
                <option value="Zone 3">Zone 3 — South & South East</option>
                <option value="Zone 4">Zone 4 — West & Highlands</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>School Name</label>
              <select value={form.triggers} onChange={e => setForm({ ...form, triggers: e.target.value })} disabled={!selectedZone}>
                <option value="">{selectedZone ? '-- Select school --' : '-- Select zone first --'}</option>
                {schoolList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Medical Information</h2>
          <div className="form-group">
            <label>Type of seizures I experience</label>
            <select value={form.seizure_type} onChange={e => setForm({ ...form, seizure_type: e.target.value })}>
              <option value="">-- Select seizure type --</option>
              {seizureTypes.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
            </select>
            {selectedSeizure && (
              <div style={{ background: '#e6fff5', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: '#0F6E56', marginTop: '-8px', marginBottom: '12px' }}>
                ℹ️ {selectedSeizure.desc}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>My current medication</label>
            <select value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })}>
              <option value="">-- Select medication --</option>
              {medications.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>My known triggers</label>
            <select value={form.seizure_type === form.triggers ? '' : form.triggers} onChange={e => setForm({ ...form, triggers: e.target.value })}>
              <option value="">-- Select main trigger --</option>
              {triggerOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '8px' }}>My Seizure Action Plan</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>Tick the steps you want staff to follow when you have a seizure. Untick any that do not apply to you.</p>
          {actionSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '6px', background: selectedActions.includes(step) ? '#e6fff5' : '#f9f9f9', borderRadius: '8px', border: selectedActions.includes(step) ? '1px solid #3ECF8E' : '1px solid #eee', cursor: 'pointer' }} onClick={() => toggleAction(step)}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: selectedActions.includes(step) ? '#3ECF8E' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selectedActions.includes(step) && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
              </div>
              <span style={{ fontSize: '13px', color: '#333' }}><strong>{i + 1}.</strong> {step}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Emergency Contact</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Parent/Guardian Name</label>
              <input value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="e.g. 5XXXXXXX" />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', marginBottom: '16px' }} onClick={handleSubmit} disabled={saving}>
          {saving ? 'Submitting...' : 'Submit My Registration'}
        </button>

        <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px' }}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default SelfRegister