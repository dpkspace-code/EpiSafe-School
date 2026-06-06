import { useState } from 'react'
import { supabase } from '../supabase'

const questions = [
  { id: 1, text: 'Has the learner ever had a seizure or convulsion?', weight: 3 },
  { id: 2, text: 'Has the learner been diagnosed with epilepsy by a doctor?', weight: 4 },
  { id: 3, text: 'Does the learner have a parent or sibling with epilepsy?', weight: 1 },
  { id: 4, text: 'Has the learner had a fever-related convulsion in childhood?', weight: 2 },
  { id: 5, text: 'Has the learner had a significant head injury or brain surgery?', weight: 2 },
  { id: 6, text: 'Does the learner have episodes of staring, confusion or unexplained falls?', weight: 2 },
  { id: 7, text: 'Is the learner currently on anti-epileptic medication?', weight: 3 },
]

function Screener() {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [riskLevel, setRiskLevel] = useState('')
  const [saving, setSaving] = useState(false)

  const totalWeight = questions.reduce((a, q) => a + q.weight, 0)

  function setAnswer(id, val) {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  function calcRisk() {
    const score = questions.reduce((a, q) => answers[q.id] === 'yes' ? a + q.weight : a, 0)
    const pct = (score / totalWeight) * 100
    if (pct >= 40) return { level: 'High', score }
    if (pct >= 20) return { level: 'Moderate', score }
    return { level: 'Low', score }
  }

  async function handleSubmit() {
    if (!name || !grade) return alert('Please enter learner name and grade')
    const answered = Object.keys(answers).length
    if (answered < questions.length) return alert('Please answer all questions')
    setSaving(true)
    const { level, score } = calcRisk()
    await supabase.from('screener_responses').insert([{
      learner_name: name,
      grade,
      answers,
      risk_score: score,
      risk_level: level
    }])
    setRiskLevel(level)
    setSubmitted(true)
    setSaving(false)
  }

  function reset() {
    setName(''); setGrade(''); setAnswers({}); setSubmitted(false); setRiskLevel('')
  }

  if (submitted) {
    const color = riskLevel === 'High' ? '#ff4d4f' : riskLevel === 'Moderate' ? '#fa8c16' : '#3ECF8E'
    return (
      <div>
        <h1>📋 Screener Result</h1>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {riskLevel === 'High' ? '🔴' : riskLevel === 'Moderate' ? '🟡' : '🟢'}
          </div>
          <h2 style={{ color, fontSize: '28px' }}>{riskLevel} Risk</h2>
          <p style={{ margin: '12px 0 24px' }}>
            {riskLevel === 'High' && 'This learner should be referred for medical evaluation immediately.'}
            {riskLevel === 'Moderate' && 'Monitor this learner closely and consider a medical review.'}
            {riskLevel === 'Low' && 'No immediate action required. Continue routine monitoring.'}
          </p>
          <p style={{ marginBottom: '24px' }}><strong>{name}</strong> — Grade {grade}</p>
          <button className="btn btn-primary" onClick={reset}>Screen Another Learner</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>📋 Seizure Risk Screener</h1>
      <p style={{ marginBottom: '24px' }}>Complete this form for each learner. This is not a diagnosis — it flags learners for medical follow-up.</p>

      <div className="card">
        <h2>Learner Details</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter learner's full name" />
        </div>
        <div className="form-group">
          <label>Grade</label>
          <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. Grade 7" />
        </div>
      </div>

      <div className="card">
        <h2>Screening Questions</h2>
        {questions.map(q => (
          <div key={q.id} style={{ marginBottom: '16px', padding: '14px', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ color: '#333', marginBottom: '10px' }}>{q.text}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn"
                style={{ background: answers[q.id] === 'yes' ? '#3ECF8E' : '#eee', color: answers[q.id] === 'yes' ? 'white' : '#333' }}
                onClick={() => setAnswer(q.id, 'yes')}>Yes</button>
              <button
                className="btn"
                style={{ background: answers[q.id] === 'no' ? '#1a1a2e' : '#eee', color: answers[q.id] === 'no' ? 'white' : '#333' }}
                onClick={() => setAnswer(q.id, 'no')}>No</button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
        {saving ? 'Saving...' : 'Submit Screening'}
      </button>
    </div>
  )
}

export default Screener