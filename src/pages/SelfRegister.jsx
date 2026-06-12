import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const grades = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','Grade 13']

const schoolsByZone = {
  'Zone 1': ['Adolphe de Plevitz SSS','James Burty David SSS','Droopnath Ramphul State College','Frank Richard SSS','Goodlands SSS','Lady Sushil Ramgoolam SSS','Pailles SSS','Pamplemousses SSS','Piton SC','Port Louis North SSS','Port Louis SSS','G. M. Dawjee Atchia State College','Prof. Hassan Raffa SSS','Rabindranath Tagore SSS','Ramsoondur Prayag SSS','R. Seeneevassen SSS','Riviere du Rempart SSS','Royal College Port Louis','Sharma Jugdambi SSS','Shri Beekrumsingh Ramlallah SSS','Sir A. R. Mohamed SSS','Terre Rouge SSS','Triolet SSS','Alpha College','Bhujoharry College','BPS Fatima College','Bradley College','College Ideal','College Pere Laval','Cosmopolitain College','DAV HSC College','DAV College','Labourdonnais College','Friendship College (Boys)','Friendship College (Girls)','International College','Islamic Cultural College','Islamic Cultural Form VI College','London College','Loreto College Port Louis','Madad Ul Islam Girls College','Merton College','Muslim Girls College','Pamplemousses High School','Port Louis High School','S Munrakhun College',"Saint Bartholomew's College",'Universal College'],
  'Zone 2': ['Beau Bassin SSS','Bel Air Riviere Seche SSS','Bon Accueil State College','Camp de Masque State College','Ebene SSS (Boys)','Ebene SSS (Girls)','John Kennedy College','Mahatma Gandhi Institute','Mahatma Gandhi SS Centre de Flacq','Mahatma Gandhi SS Moka','Manilall Doctor SSS','Marcel Cabon SSS','Quartier Militaire SSS','Queen Elizabeth College','Rajcoomar Gujadhur SSS','Sebastopol SSS','Shrimati Indira Gandhi SSS','Sir Leckraz Teelock SSS','Byron College','La Confiance College','College des Ville Soeurs','Loreto College Rose Hill','Rose Hill Muslim College','Royal College Curepipe','Royal College Beau Bassin',"St Andrew's College",'St Joseph College',"St Mary's College",'Vieux Grand Port SSS','Sodnac SSS'],
  'Zone 3': ['Curepipe College','Bel Ombre SSS','Chemin Grenier SSS','Henrietta SSS','Mahebourg SSS',"Mare d'Albert SSS",'New Eben Ezer SSS','Phoenix SSS','Plaine Magnien SSS','Riviere des Anguilles State College','Rose Belle SSS','Sookdeo Bissoondoyal State College','Stanley College','Surinam SSS','Tyack SSS','Wooton SSS','Loreto College Curepipe','St Gabriel College','St Esprit College','Sodnac College','Nouvelle France College','Savanne College','Grand Bois College'],
  'Zone 4': ['Bambous SSS','Cascades SSS','Ecole du Centre SSS','Floreal SSS','Forest Side SSS','Quatre Bornes SSS','Royal College Rose Hill','Vacoas SSS','Highlands College','Belle Rose SSS','Tamarin SSS','Black River SSS','Flic en Flac SSS','Petite Riviere SSS','Dr Regis Chaperon SSS','Loreto College Quatre Bornes','St Andrews College','Clavis College','Savannah College'],
}

const screeningQuestions = [
  { id: 'sq1', text: 'Have you ever had a seizure or convulsion?', options: ['Never', 'Once', '2-5 times', 'More than 5 times'], weights: [0, 3, 5, 7] },
  { id: 'sq2', text: 'Have you been diagnosed with epilepsy by a doctor?', options: ['No', 'Under investigation', 'Yes — recently', 'Yes — long standing'], weights: [0, 3, 5, 6] },
  { id: 'sq3', text: 'Does any parent or sibling have epilepsy?', options: ['No', 'Not sure', 'Yes — one relative', 'Yes — more than one'], weights: [0, 1, 3, 5] },
  { id: 'sq4', text: 'Have you ever had a fever-related convulsion?', options: ['No', 'Once', 'More than once'], weights: [0, 2, 4] },
  { id: 'sq5', text: 'Have you had a significant head injury or brain surgery?', options: ['No', 'Minor injury', 'Significant injury', 'Brain surgery'], weights: [0, 1, 4, 6] },
  { id: 'sq6', text: 'Do you experience blank staring or confusion episodes?', options: ['Never', 'Rarely', 'Sometimes', 'Frequently'], weights: [0, 2, 4, 6] },
  { id: 'sq7', text: 'Are you currently on anti-epileptic medication?', options: ['No', 'Yes — controls well', 'Yes — still having seizures', 'Was on medication, stopped'], weights: [0, 2, 5, 6] },
  { id: 'sq8', text: 'Have you ever had a seizure at school?', options: ['Never', 'Once', 'More than once'], weights: [0, 4, 7] },
]

const totalMaxScore = screeningQuestions.reduce((sum, q) => sum + Math.max(...q.weights), 0)

function calcRiskLevel(answers) {
  const score = Object.values(answers).reduce((sum, a) => sum + (a.weight || 0), 0)
  const pct = (score / totalMaxScore) * 100
  if (pct >= 50) return { level: 'High', score }
  if (pct >= 25) return { level: 'Moderate', score }
  if (pct >= 10) return { level: 'Low-Moderate', score }
  return { level: 'Low', score }
}

function SelfRegister({ session, onLogout }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=personal, 2=medical, 3=screening, 4=emergency
  const [selectedZone, setSelectedZone] = useState('')
  const [screenAnswers, setScreenAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '', grade: '', class: '', has_seizures: '', seizure_type: '',
    medication: '', triggers: '', emergency_contact_name: '',
    emergency_contact_phone: '', emergency_contact_email: '', action_plan: '', status: 'pending'
  })

  function goHome() {
    onLogout()
    navigate('/')
  }

  const selectedSeizure = seizureTypes.find(s => s.value === form.seizure_type)
  const schoolList = selectedZone ? schoolsByZone[selectedZone] : []

  function setScreenAnswer(id, optionIndex, weight) {
    setScreenAnswers(prev => ({ ...prev, [id]: { index: optionIndex, weight } }))
  }

  const screeningComplete = screeningQuestions.every(q => screenAnswers[q.id] !== undefined)

  async function handleSubmit() {
    if (!form.full_name) return setError('Please enter your full name')
    if (!form.grade) return setError('Please select your grade')
    setSaving(true)
    const { level, score } = calcRiskLevel(screenAnswers)
    const finalForm = {
      ...form,
      action_plan: level,
      status: level === 'High' || level === 'Moderate' ? 'review' : 'pending',
    }
    const { error: dbError } = await supabase.from('learners').insert([finalForm])
    await supabase.from('screener_responses').insert([{
      learner_name: form.full_name,
      grade: form.grade,
      answers: JSON.stringify(screenAnswers),
      risk_score: score,
      risk_level: level,
    }])
    if (dbError) setError('Error: ' + dbError.message)
    else setSubmitted(true)
    setSaving(false)
  }

  const steps = ['Personal Details', 'Medical Info', 'Health Screening', 'Emergency Contact']

  if (submitted) {
    const { level } = calcRiskLevel(screenAnswers)
    const colors = { High: '#ff4d4f', Moderate: '#fa8c16', 'Low-Moderate': '#fadb14', Low: '#3ECF8E' }
    const emojis = { High: '🔴', Moderate: '🟠', 'Low-Moderate': '🟡', Low: '🟢' }
    const vulnScores = { High: 9, Moderate: 6, 'Low-Moderate': 4, Low: 2 }
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '480px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#1a1a2e', marginBottom: '12px' }}>Registration Complete!</h2>
          <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '20px' }}>
            Thank you for registering. Your information has been securely submitted to the school health team.
          </p>
          <div style={{ background: '#f0f4f8', border: '1px solid #e0e6ed', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Epilepsy Vulnerability Level</p>
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{emojis[level]}</div>
            <p style={{ fontSize: '0.9375rem', color: colors[level], fontWeight: '700', marginBottom: level !== 'Low' ? '4px' : 0 }}>
              {level} ({vulnScores[level]}/10)
            </p>
            {level !== 'Low' && (
              <p style={{ fontSize: '0.8125rem', color: colors[level], fontWeight: '500' }}>
                A staff member will follow up with you shortly.
              </p>
            )}
          </div>
          <button className="btn btn-primary" onClick={onLogout}>Done</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', padding: '20px' }}>
      <button onClick={goHome} style={{ position: 'fixed', top: '16px', left: '16px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8125rem', color: '#666', cursor: 'pointer', zIndex: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        🏠 Home
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '2.25rem' }}>🧠</div>
          <h1 style={{ color: '#1a1a2e', fontSize: '1.25rem', marginBottom: '4px' }}>EpiSafe — Learner Registration</h1>
          <p style={{ color: '#888', fontSize: '0.8125rem' }}>Your information is confidential and secure</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '4px', borderRadius: '2px', marginBottom: '6px',
                background: i < step ? '#3ECF8E' : i === step - 1 ? '#3ECF8E' : '#e0e0e0'
              }} />
              <div style={{ fontSize: '0.5625rem', color: i === step - 1 ? '#3ECF8E' : '#aaa', fontWeight: i === step - 1 ? '700' : '400' }}>
                {s}
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ background: '#fff1f0', color: '#ff4d4f', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8125rem' }}>{error}</div>}

        {/* STEP 1 — Personal Details */}
        {step === 1 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>👤 Personal Details</h2>
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
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}
              onClick={() => { if (!form.full_name || !form.grade) return setError('Please fill in name and grade'); setError(''); setStep(2) }}>
              Next →
            </button>
          </div>
        )}

        {/* STEP 2 — Medical Info */}
        {step === 2 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>🏥 Medical Information</h2>

            <div className="form-group">
              <label>Have you ever experienced a seizure?</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <button
                  onClick={() => setForm({ ...form, has_seizures: 'No', seizure_type: '', medication: '' })}
                  style={{ flex: 1, padding: '10px', border: form.has_seizures === 'No' ? '2px solid #3ECF8E' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: form.has_seizures === 'No' ? '#e6fff5' : 'white', color: form.has_seizures === 'No' ? '#0F6E56' : '#666', fontWeight: form.has_seizures === 'No' ? '500' : '400' }}>
                  No
                </button>
                <button
                  onClick={() => setForm({ ...form, has_seizures: 'Yes' })}
                  style={{ flex: 1, padding: '10px', border: form.has_seizures === 'Yes' ? '2px solid #3ECF8E' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: form.has_seizures === 'Yes' ? '#e6fff5' : 'white', color: form.has_seizures === 'Yes' ? '#0F6E56' : '#666', fontWeight: form.has_seizures === 'Yes' ? '500' : '400' }}>
                  Yes
                </button>
              </div>
            </div>

            {form.has_seizures === 'Yes' && (
              <>
                <div className="form-group">
                  <label>Type of seizures I experience</label>
                  <select value={form.seizure_type} onChange={e => setForm({ ...form, seizure_type: e.target.value })}>
                    <option value="">-- Select seizure type --</option>
                    {seizureTypes.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                  </select>
                  {selectedSeizure && (
                    <div style={{ background: '#e6fff5', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8125rem', color: '#0F6E56', marginTop: '-8px', marginBottom: '12px' }}>
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
              </>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                onClick={() => { if (!form.has_seizures) return setError('Please answer the seizure question'); setError(''); setStep(3) }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Health Screening */}
        {step === 3 && (
          <div className="card">
            <h2 style={{ marginBottom: '4px' }}>📋 Health Screening</h2>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '16px' }}>Answer honestly — this helps identify if you need health support at school.</p>
            {screeningQuestions.map((q, i) => (
              <div key={q.id} style={{ marginBottom: '14px', padding: '12px', background: screenAnswers[q.id] !== undefined ? '#f9fffe' : '#f9f9f9', borderRadius: '8px', border: screenAnswers[q.id] !== undefined ? '1px solid #3ECF8E' : '1px solid #eee' }}>
                <p style={{ fontSize: '0.8125rem', color: '#333', marginBottom: '8px', fontWeight: '500' }}>{i + 1}. {q.text}</p>
                <select
                  value={screenAnswers[q.id]?.index ?? ''}
                  onChange={e => { const idx = parseInt(e.target.value); setScreenAnswer(q.id, idx, q.weights[idx]) }}
                  style={{ marginBottom: 0 }}>
                  <option value="">-- Select answer --</option>
                  {q.options.map((opt, oi) => <option key={oi} value={oi}>{opt}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                onClick={() => { if (!screeningComplete) return setError('Please answer all screening questions'); setError(''); setStep(4) }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Emergency Contact */}
        {step === 4 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>🆘 Emergency Contact</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label>Parent/Guardian Name</label>
                <input value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="e.g. 5XXXXXXX" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Email Address (optional)</label>
                <input type="email" value={form.emergency_contact_email} onChange={e => setForm({ ...form, emergency_contact_email: e.target.value })} placeholder="parent@example.com" />
              </div>
            </div>
            <div style={{ background: '#e6fff5', border: '1px solid #3ECF8E', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '0.75rem', color: '#0F6E56' }}>
              ✅ Almost done! By submitting you confirm that the information provided is accurate and you consent to it being stored securely by your school health team.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Submitting...' : '✅ Submit Registration'}
              </button>
            </div>
          </div>
        )}

        <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.8125rem', marginTop: '8px' }}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default SelfRegister