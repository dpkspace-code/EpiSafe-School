import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Pending() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPending() }, [])

  async function fetchPending() {
    setLoading(true)
    const { data } = await supabase
      .from('learners').select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setPending(data || [])
    setLoading(false)
  }

  async function approve(id) {
    await supabase.from('learners').update({ status: 'active' }).eq('id', id)
    fetchPending()
  }

  async function reject(id) {
    if (!confirm('Are you sure you want to reject and remove this registration?')) return
    await supabase.from('learners').delete().eq('id', id)
    fetchPending()
  }

  const riskColor = r => r === 'High' ? '#ff4d4f' : r === 'Moderate' ? '#fa8c16' : '#3ECF8E'

  return (
    <div>
      <h1>⏳ Pending Approvals</h1>
      <p style={{ marginBottom: '24px' }}>Review learner self-registrations and approve or reject them.</p>

      {loading ? <p>Loading...</p> : pending.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2>All caught up!</h2>
          <p style={{ color: '#888' }}>No pending registrations to review.</p>
        </div>
      ) : (
        pending.map(l => (
          <div key={l.id} className="card" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '16px' }}>{l.full_name}</h2>
                  {l.action_plan && (
                    <span style={{ background: riskColor(l.action_plan) + '22', color: riskColor(l.action_plan), border: `1px solid ${riskColor(l.action_plan)}44`, borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
                      {l.action_plan} Risk
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}><strong>Grade:</strong> {l.grade || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}><strong>Gender:</strong> {l.class || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}><strong>School:</strong> {l.triggers || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}><strong>Seizure Type:</strong> {l.seizure_type || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}><strong>Medication:</strong> {l.medication || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}><strong>Emergency:</strong> {l.emergency_contact_name || '—'} {l.emergency_contact_phone || ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button className="btn btn-primary" onClick={() => approve(l.id)}>✅ Approve</button>
                <button className="btn btn-danger" onClick={() => reject(l.id)}>❌ Reject</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Pending