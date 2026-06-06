import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Registry() {
  const [learners, setLearners] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '', grade: '', class: '', seizure_type: '',
    medication: '', triggers: '', emergency_contact_name: '',
    emergency_contact_phone: '', action_plan: '', status: 'active'
  })

  useEffect(() => { fetchLearners() }, [])

  async function fetchLearners() {
    setLoading(true)
    const { data, error } = await supabase.from('learners').select('*').order('created_at', { ascending: false })
    console.log('fetch error:', error)
    setLearners(data || [])
    setLoading(false)
  }

  async function handleSubmit() {
    if (!form.full_name) return alert('Please enter learner name')
    const { data, error } = await supabase.from('learners').insert([form])
    console.log('insert error:', error)
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setForm({ full_name: '', grade: '', class: '', seizure_type: '', medication: '', triggers: '', emergency_contact_name: '', emergency_contact_phone: '', action_plan: '', status: 'active' })
      setShowForm(false)
      fetchLearners()
    }
  }

  async function deleteLearner(id) {
    if (!confirm('Are you sure?')) return
    await supabase.from('learners').delete().eq('id', id)
    fetchLearners()
  }

  const badgeClass = status => status === 'active' ? 'badge badge-green' : status === 'review' ? 'badge badge-amber' : 'badge badge-red'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>👥 Learner Registry</h1>
          <p>Confirmed epilepsy cases and seizure action plans</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Add Learner'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>New Learner</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Grade</label>
              <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="e.g. Grade 8" />
            </div>
            <div className="form-group">
              <label>Class</label>
              <input value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} placeholder="e.g. 8A" />
            </div>
            <div className="form-group">
              <label>Seizure Type</label>
              <input value={form.seizure_type} onChange={e => setForm({ ...form, seizure_type: e.target.value })} placeholder="e.g. Absence seizures" />
            </div>
            <div className="form-group">
              <label>Medication</label>
              <input value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })} placeholder="Current medication" />
            </div>
            <div className="form-group">
              <label>Triggers</label>
              <input value={form.triggers} onChange={e => setForm({ ...form, triggers: e.target.value })} placeholder="Known triggers" />
            </div>
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Parent/Guardian name" />
            </div>
            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active — Plan in place</option>
                <option value="review">Needs Review</option>
                <option value="pending">Pending Evaluation</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Seizure Action Plan</label>
            <textarea rows={3} value={form.action_plan} onChange={e => setForm({ ...form, action_plan: e.target.value })} placeholder="Describe what staff should do during a seizure..." />
          </div>
          <button className="btn btn-primary" onClick={handleSubmit}>Save Learner</button>
        </div>
      )}

      <div className="card">
        {loading ? <p>Loading...</p> : learners.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No learners in registry yet. Add your first learner above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Grade</th><th>Seizure Type</th><th>Emergency Contact</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {learners.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.full_name}</strong></td>
                  <td>{l.grade} {l.class}</td>
                  <td>{l.seizure_type || '—'}</td>
                  <td>{l.emergency_contact_name}<br /><small style={{ color: '#888' }}>{l.emergency_contact_phone}</small></td>
                  <td><span className={badgeClass(l.status)}>{l.status}</span></td>
                  <td><button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => deleteLearner(l.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Registry