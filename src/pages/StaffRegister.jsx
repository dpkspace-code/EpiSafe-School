import { useState } from 'react'
import { supabase } from '../supabase'

const staffTypes = [
  'Teacher', 'Head of Department', 'Deputy Rector', 'Rector',
  'Administrative Staff', 'Library Staff', 'Laboratory Technician',
  'Cleaner', 'Security Officer', 'Canteen Staff', 'Other Support Staff',
]

const departments = [
  'Sciences', 'Mathematics', 'Languages', 'Humanities',
  'Physical Education', 'Arts', 'ICT', 'Administration',
  'Support Services', 'Other',
]

const seizureTypes = [
  { value: 'Tonic-clonic (Grand mal)', desc: 'Body stiffens then jerks — I may fall and lose consciousness' },
  { value: 'Absence', desc: 'I have brief blank stares and appear unresponsive for a few seconds' },
  { value: 'Focal (Partial)', desc: 'Affects one part of my body, I may stay conscious but feel confused' },
  { value: 'Atonic (Drop attack)', desc: 'I suddenly lose muscle tone and fall without warning' },
  { value: 'Myoclonic', desc: 'I have sudden brief muscle jerks, often in my arms' },
  { value: 'Unknown / Not yet diagnosed', desc: 'My seizure type has not been confirmed by a doctor yet' },
]

const medications = [
  'Sodium Valproate (Epilim)', 'Carbamazepine (Tegretol)',
  'Lamotrigine (Lamictal)', 'Levetiracetam (Keppra)',
  'Phenobarbitone', 'Clonazepam (Rivotril)',
  'Multiple medications', 'No medication', 'Unknown',
]

const screeningQuestions = [
  { id: 'sq1', text: 'Have you ever had a seizure or convulsion?', options: ['Never', 'Once', '2-5 times', 'More than 5 times'], weights: [0, 3, 5, 7] },
  { id: 'sq2', text: 'Have you been diagnosed with epilepsy by a doctor?', options: ['No', 'Under investigation', 'Yes — recently', 'Yes — long standing'], weights: [0, 3, 5, 6] },
  { id: 'sq3', text: 'Does any parent or sibling have epilepsy?', options: ['No', 'Not sure', 'Yes — one relative', 'Yes — more than one'], weights: [0, 1, 3, 5] },
  { id: 'sq4', text: 'Have you ever had a fever-related convulsion?', options: ['No', 'Once', 'More than once'], weights: [0, 2, 4] },
  { id: 'sq5', text: 'Have you had a significant head injury or brain surgery?', options: ['No', 'Minor injury', 'Significant injury', 'Brain surgery'], weights: [0, 1, 4, 6] },
  { id: 'sq6', text: 'Do you experience blank staring or confusion episodes?', options: ['Never', 'Rarely', 'Sometimes', 'Frequently'], weights: [0, 2, 4, 6] },
  { id: 'sq7', text: 'Are you currently on anti-epileptic medication?', options: ['No', 'Yes — controls well', 'Yes — still having seizures', 'Was on medication, stopped'], weights: [0, 2, 5, 6] },
  { id: 'sq8', text: 'Have you ever had a seizure at your workplace?', options: ['Never', 'Once', 'More than once'], weights: [0, 4, 7] },
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

function StaffRegister({ onLogout }) {
  const [step, setStep] = useState(1)
  const [screenAnswers, setScreenAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [riskResult, setRiskResult] = useState(null)
  const [form, setForm] = useState({
    full_name: '', staff_type: '', department: '',
    seizure_type: '', medication: '',
    emergency_contact_name: '', emergency_contact_phone: '',
  })

  const selectedSeizure = seizureTypes.find(s => s.value === form.seizure_type)
  const screeningComplete = screeningQuestions.every(q => screenAnswers[q.id] !== undefined)

  function setScreenAnswer(id, optionIndex, weight) {
    setScreenAnswers(prev => ({ ...prev, [id]: { index: optionIndex, weight } }))
  }

  async function handleSubmit() {
    if (!form.full_name) return setError('Please enter your full name')
    setSaving(true)
    const { level, score } = calcRiskLevel(screenAnswers)
    const { error: dbError } = await supabase.from('staff_registry').insert([{
      full_name: form.full_name,
      staff_type: form.staff_type,
      department: form.department,
      seizure_type: form.seizure_type,
      medication: form.medication,
      emergency_contact_name: form.emergency_contact_name,
      emergency_contact_phone: form.emergency_contact_phone,
      risk_level: level,
      risk_score: score,
      status: level === 'High' || level === 'Moderate' ? 'review' : 'pending',
    }])
    if (dbError) {
      setError('Error: ' + dbError.message)
      setSaving(false)
    } else {
      setRiskResult({ level, score })
      setSubmitted(true)
      setSaving(false)
    }
  }

  const steps = ['Personal Details', 'Medical Info', 'Health Screening', 'Emergency Contact']
  const colors = { High: '#ff4d4f', Moderate: '#fa8c16', 'Low-Moderate': '#fadb14', Low: '#3ECF8E' }
  const emojis = { High: '🔴', Moderate: '🟠', 'Low-Moderate': '🟡', Low: '🟢' }

  if (submitted && riskResult) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#1a1a2e', marginBottom: '12px' }}>Registration Complete!</h2>
          <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '20px' }}>
            Thank you for registering. Your information has been securely submitted to the school health team.
          </p>
          {riskResult.level !== 'Low' && (
            <div style={{ background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{emojis[riskResult.level]}</div>
              <p style={{ fontSize: '13px', color: colors[riskResult.level], fontWeight: '600' }}>
                {riskResult.level} Risk Detected — A health team member will follow up with you shortly.
              </p>
            </div>
          )}
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            You may now logout or close this page.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => window.location.href = '/'}>
            🚪 Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '36px' }}>🧠</div>
          <h1 style={{ color: '#1a1a2e', fontSize: '20px', marginBottom: '4px' }}>EpiSafe — Staff Registration</h1>
          <p style={{ color: '#888', fontSize: '13px' }}>Your information is confidential and secure</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '4px', borderRadius: '2px', marginBottom: '6px', background: i < step ? '#3ECF8E' : i === step - 1 ? '#3ECF8E' : '#e0e0e0' }} />
              <div style={{ fontSize: '9px', color: i === step - 1 ? '#3ECF8E' : '#aaa', fontWeight: i === step - 1 ? '700' : '400' }}>{s}</div>
            </div>
          ))}
        </div>

        {error && <div style={{ background: '#fff1f0', color: '#ff4d4f', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

        {step === 1 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>👤 Personal Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Full Name *</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label>Staff Type</label>
                <select value={form.staff_type} onChange={e => setForm({ ...form, staff_type: e.target.value })}>
                  <option value="">-- Select staff type --</option>
                  {staffTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">-- Select department --</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}
              onClick={() => { if (!form.full_name) return setError('Please enter your full name'); setError(''); setStep(2) }}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>🏥 Medical Information</h2>
            <div className="form-group">
              <label>Type of seizures I experience (if any)</label>
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setError(''); setStep(3) }}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <h2 style={{ marginBottom: '4px' }}>📋 Health Screening</h2>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>Answer honestly — this helps identify if you need health support at work.</p>
            {screeningQuestions.map((q, i) => (
              <div key={q.id} style={{ marginBottom: '14px', padding: '12px', background: screenAnswers[q.id] !== undefined ? '#f9fffe' : '#f9f9f9', borderRadius: '8px', border: screenAnswers[q.id] !== undefined ? '1px solid #3ECF8E' : '1px solid #eee' }}>
                <p style={{ fontSize: '13px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>{i + 1}. {q.text}</p>
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

        {step === 4 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>🆘 Emergency Contact</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label>Contact Name</label>
                <input value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="e.g. 5XXXXXXX" />
              </div>
            </div>
            <div style={{ background: '#e6fff5', border: '1px solid #3ECF8E', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#0F6E56' }}>
              ✅ By submitting you confirm that the information provided is accurate and you consent to it being stored securely by the school health team.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Submitting...' : '✅ Submit Registration'}
              </button>
            </div>
          </div>
        )}

        <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default StaffRegister