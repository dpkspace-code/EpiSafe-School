import { useState } from 'react'
import { supabase } from '../supabase'

const sections = [
  {
    title: '🧠 Personal Seizure History',
    questions: [
      { id: 'q1', text: 'Has the learner ever had a seizure or convulsion?', options: ['Never', 'Once', '2-5 times', 'More than 5 times'], weights: [0, 3, 5, 7] },
      { id: 'q2', text: 'How recent was the last seizure?', options: ['Never had one', 'More than 2 years ago', 'Within the last 2 years', 'Within the last 6 months', 'Within the last month'], weights: [0, 1, 3, 5, 7] },
      { id: 'q3', text: 'How long do the seizures typically last?', options: ['Never had one', 'Less than 1 minute', '1-5 minutes', 'More than 5 minutes'], weights: [0, 1, 3, 6] },
    ],
  },
  {
    title: '🏥 Medical Diagnosis & Treatment',
    questions: [
      { id: 'q4', text: 'Has the learner been formally diagnosed with epilepsy by a doctor?', options: ['No', 'Under investigation', 'Yes — recently diagnosed', 'Yes — long-standing diagnosis'], weights: [0, 3, 5, 6] },
      { id: 'q5', text: 'Is the learner currently on anti-epileptic medication?', options: ['No', 'Yes — medication controls seizures well', 'Yes — but seizures still occur', 'Was on medication but stopped'], weights: [0, 2, 5, 6] },
      { id: 'q6', text: 'Has the learner ever been hospitalised due to a seizure?', options: ['Never', 'Once', 'More than once'], weights: [0, 4, 7] },
    ],
  },
  {
    title: '👨‍👩‍👧 Family History',
    questions: [
      { id: 'q7', text: 'Does any first-degree relative (parent or sibling) have epilepsy?', options: ['No', 'Not sure', 'Yes — one relative', 'Yes — more than one relative'], weights: [0, 1, 3, 5] },
      { id: 'q8', text: 'Has any family member been diagnosed with a neurological condition?', options: ['No', 'Not sure', 'Yes'], weights: [0, 1, 3] },
    ],
  },
  {
    title: '⚡ Seizure Characteristics & Triggers',
    questions: [
      { id: 'q9', text: 'Does the learner experience warning signs before a seizure (aura)?', options: ['Never had a seizure', 'No warning signs', 'Sometimes', 'Always has warning signs'], weights: [0, 1, 3, 4] },
      { id: 'q10', text: 'Does the learner lose consciousness during episodes?', options: ['Never', 'Rarely', 'Sometimes', 'Always'], weights: [0, 2, 4, 6] },
      { id: 'q11', text: 'Has the learner had a fever-related convulsion in childhood?', options: ['No', 'Once', 'More than once'], weights: [0, 2, 4] },
      { id: 'q12', text: 'Does the learner have known seizure triggers?', options: ['No known triggers', 'Possible triggers not confirmed', 'Yes — one known trigger', 'Yes — multiple known triggers'], weights: [0, 1, 3, 5] },
    ],
  },
  {
    title: '🏫 Impact at School',
    questions: [
      { id: 'q13', text: 'Has the learner ever had a seizure at school or during school activities?', options: ['Never', 'Once', 'More than once'], weights: [0, 4, 7] },
      { id: 'q14', text: 'Does the learner experience episodes of blank staring or confusion in class?', options: ['Never', 'Rarely', 'Sometimes', 'Frequently'], weights: [0, 2, 4, 6] },
      { id: 'q15', text: 'Has the learner missed school due to seizures or related health issues?', options: ['Never', 'Occasionally', 'Frequently'], weights: [0, 2, 5] },
    ],
  },
  {
    title: '🩺 Physical Risk Indicators',
    questions: [
      { id: 'q16', text: 'Has the learner had a significant head injury or brain surgery?', options: ['No', 'Minor head injury', 'Significant head injury', 'Brain surgery'], weights: [0, 1, 4, 6] },
      { id: 'q17', text: 'Does the learner have any other neurological conditions?', options: ['No', 'Not sure', 'Yes'], weights: [0, 1, 4] },
      { id: 'q18', text: 'How would you describe the learner\'s overall seizure control?', options: ['No seizures ever', 'Well controlled', 'Partially controlled', 'Poorly controlled'], weights: [0, 1, 4, 7] },
    ],
  },
]

const totalMaxScore = sections.reduce((total, section) =>
  total + section.questions.reduce((sum, q) => sum + Math.max(...q.weights), 0), 0)

const grades = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','Grade 13']

function Screener({ schoolId }) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [addedToRegistry, setAddedToRegistry] = useState(false)

  function setAnswer(id, optionIndex, weight) {
    setAnswers(prev => ({ ...prev, [id]: { index: optionIndex, weight } }))
  }

  function calcRisk() {
    const score = Object.values(answers).reduce((sum, a) => sum + a.weight, 0)
    const pct = (score / totalMaxScore) * 100
    if (pct >= 50) return { level: 'High', score, pct: Math.round(pct) }
    if (pct >= 25) return { level: 'Moderate', score, pct: Math.round(pct) }
    if (pct >= 10) return { level: 'Low-Moderate', score, pct: Math.round(pct) }
    return { level: 'Low', score, pct: Math.round(pct) }
  }

  const answeredInSection = (section) => section.questions.every(q => answers[q.id] !== undefined)
  const allAnswered = sections.every(s => answeredInSection(s))

  async function handleSubmit() {
    if (!name || !grade) return alert('Please enter learner name and grade')
    if (!allAnswered) return alert('Please answer all questions in all sections')
    setSaving(true)
    const r = calcRisk()
    await supabase.from('screener_responses').insert([{
      learner_name: name,
      grade,
      answers: JSON.stringify(answers),
      risk_score: r.score,
      risk_level: r.level,
      school_id: schoolId,
    }])
    setResult(r)
    setSubmitted(true)
    setSaving(false)
  }

  async function addToRegistry() {
    const { error } = await supabase.from('learners').insert([{
      full_name: name,
      grade,
      emergency_contact_name: parentName,
      emergency_contact_phone: parentPhone,
      status: 'pending',
      action_plan: result.level,
      school_id: schoolId,
    }])
    if (error) alert('Error: ' + error.message)
    else setAddedToRegistry(true)
  }

  function sendWhatsApp() {
    const phone = parentPhone?.replace(/\s/g, '')
    const message = `Dear ${parentName || 'Parent/Guardian'},\n\nFollowing a health screening conducted at school, ${name} (${grade}) has been identified as requiring a medical review regarding possible seizure risk.\n\nWe kindly request that you arrange a consultation with your doctor as soon as possible.\n\nEpiSafe School Health Team`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  function sendEmail() {
    const subject = `Health Screening Follow-up — ${name}`
    const body = `Dear ${parentName || 'Parent/Guardian'},\n\nFollowing a health screening conducted at school, ${name} (${grade}) has been identified as requiring a medical review regarding possible seizure risk.\n\nWe kindly request that you arrange a consultation with your doctor as soon as possible.\n\nEpiSafe School Health Team`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  function reset() {
    setName(''); setGrade(''); setParentName(''); setParentPhone('')
    setAnswers({}); setSubmitted(false); setResult(null)
    setCurrentSection(0); setAddedToRegistry(false)
  }

  const riskColors = { 'High': '#ff4d4f', 'Moderate': '#fa8c16', 'Low-Moderate': '#fadb14', 'Low': '#3ECF8E' }
  const riskEmojis = { 'High': '🔴', 'Moderate': '🟠', 'Low-Moderate': '🟡', 'Low': '🟢' }
  const riskMessages = {
    'High': 'This learner requires immediate referral for medical evaluation. Notify parents and school health team urgently.',
    'Moderate': 'This learner shows significant risk indicators. A medical review is strongly recommended.',
    'Low-Moderate': 'Some risk factors are present. Monitor closely and consider a medical consultation.',
    'Low': 'No significant risk indicators. Continue routine monitoring.',
  }

  if (submitted && result) {
    const isHighRisk = result.level === 'High' || result.level === 'Moderate'
    return (
      <div>
        <h1>📋 Screener Result</h1>
        <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: '16px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{riskEmojis[result.level]}</div>
          <h2 style={{ color: riskColors[result.level], fontSize: '28px', marginBottom: '8px' }}>{result.level} Risk</h2>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>Score: {result.score} / {totalMaxScore} ({result.pct}%)</div>
          <div style={{ background: '#f0f4f8', borderRadius: '8px', height: '12px', margin: '0 auto 20px', maxWidth: '400px', overflow: 'hidden' }}>
            <div style={{ width: `${result.pct}%`, height: '100%', background: riskColors[result.level], borderRadius: '8px' }} />
          </div>
          <p style={{ margin: '0 auto 24px', maxWidth: '500px', lineHeight: '1.7', color: '#444' }}>{riskMessages[result.level]}</p>
          <p style={{ color: '#666', marginBottom: '8px' }}><strong>{name}</strong> — {grade}</p>
        </div>

        {isHighRisk && (
          <div className="card" style={{ border: `1px solid ${riskColors[result.level]}44`, background: result.level === 'High' ? '#fff1f0' : '#fff7e6' }}>
            <h2 style={{ color: riskColors[result.level], marginBottom: '16px' }}>🚨 Follow-up Actions Required</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>Parent/Guardian Name</label>
                <input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Parent or guardian name" />
              </div>
              <div className="form-group">
                <label>Parent/Guardian Phone</label>
                <input value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="e.g. 5XXXXXXX" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!addedToRegistry ? (
                <button className="btn btn-primary" onClick={addToRegistry}>👥 Add to Registry</button>
              ) : (
                <button className="btn" style={{ background: '#e6fff5', color: '#0F6E56', border: '1px solid #3ECF8E' }} disabled>✅ Added to Registry</button>
              )}
              <button className="btn" style={{ background: '#25D366', color: 'white' }} onClick={sendWhatsApp} disabled={!parentPhone}>💬 Notify via WhatsApp</button>
              <button className="btn" style={{ background: '#4096ff', color: 'white' }} onClick={sendEmail}>📧 Notify via Email</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={reset}>Screen Another Learner</button>
        </div>
      </div>
    )
  }

  const section = sections[currentSection]
  const progress = Math.round((currentSection / sections.length) * 100)

  return (
    <div>
      <h1>📋 Seizure Risk Screener</h1>
      <p style={{ marginBottom: '24px' }}>A comprehensive screening tool to identify learners who may need medical follow-up.</p>

      <div className="card">
        <h2>Learner Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter learner's full name" />
          </div>
          <div className="form-group">
            <label>Grade</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="">-- Select grade --</option>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888', marginBottom: '6px' }}>
          <span>Section {currentSection + 1} of {sections.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div style={{ background: '#f0f4f8', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3ECF8E', borderRadius: '8px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setCurrentSection(i)} style={{
            padding: '6px 12px', fontSize: '12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: i === currentSection ? '#3ECF8E' : answeredInSection(s) ? '#e6fff5' : '#f0f4f8',
            color: i === currentSection ? 'white' : answeredInSection(s) ? '#0F6E56' : '#888',
            fontWeight: i === currentSection ? '500' : '400',
          }}>
            {answeredInSection(s) && i !== currentSection ? '✓ ' : ''}{i + 1}. {s.title.split(' ').slice(1).join(' ')}
          </button>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>{section.title}</h2>
        {section.questions.map((q, qi) => (
          <div key={q.id} style={{ marginBottom: '20px', padding: '16px', background: answers[q.id] !== undefined ? '#f9fffe' : '#f9f9f9', borderRadius: '8px', border: answers[q.id] !== undefined ? '1px solid #3ECF8E' : '1px solid #eee' }}>
            <p style={{ color: '#333', marginBottom: '10px', fontWeight: '500' }}>{qi + 1}. {q.text}</p>
            <select value={answers[q.id]?.index ?? ''} onChange={e => { const idx = parseInt(e.target.value); setAnswer(q.id, idx, q.weights[idx]) }} style={{ marginBottom: 0 }}>
              <option value="">-- Select an answer --</option>
              {q.options.map((opt, oi) => <option key={oi} value={oi}>{opt}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <button className="btn btn-secondary" onClick={() => setCurrentSection(prev => prev - 1)} disabled={currentSection === 0}>← Previous</button>
        {currentSection < sections.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrentSection(prev => prev + 1)} disabled={!answeredInSection(section)}>Next →</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !allAnswered}>{saving ? 'Saving...' : '✅ Submit Screening'}</button>
        )}
      </div>
    </div>
  )
}

export default Screener
