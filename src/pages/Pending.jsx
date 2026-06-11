import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const rejectionReasons = [
  'Incomplete information provided — please re-register with full details',
  'Duplicate registration — a profile already exists for this learner',
  'Information could not be verified — please visit the school health office',
  'Not a registered learner at this school',
  'Parental consent required — please contact the school health team',
  'Medical details require further clarification — please visit the school health office',
  'Learner runs no risk and is Episafe — no further action needed',
]

function Pending() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [approved, setApproved] = useState({})
  const [rejectModal, setRejectModal] = useState(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [rejected, setRejected] = useState({})

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

  async function approve(learner) {
    await supabase.from('learners').update({ status: 'active' }).eq('id', learner.id)
    setApproved(prev => ({ ...prev, [learner.id]: learner }))
    fetchPending()
  }

  async function confirmReject() {
    if (!selectedReason && !customReason) return alert('Please select or enter a reason')
    const reason = customReason || selectedReason
    const learner = rejectModal
    await supabase.from('learners').delete().eq('id', learner.id)
    setRejected(prev => ({ ...prev, [learner.id]: { ...learner, reason } }))
    setRejectModal(null)
    setSelectedReason('')
    setCustomReason('')
    fetchPending()
  }

  function dismissApproved(id) {
    setApproved(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function dismissRejected(id) {
    setRejected(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function sendWhatsApp(learner, message) {
    const phone = learner.emergency_contact_phone?.replace(/\s/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  function sendEmail(learner, subject, message) {
    const to = learner.emergency_contact_email || ''
    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank')
  }

  function approvalMessage(l) {
    return `Dear ${l.emergency_contact_name || 'Parent/Guardian'},\n\nWe are pleased to inform you that ${l.full_name}'s health registration on EpiSafe School has been APPROVED by the school health team.\n\nYour child's health profile is now active in our system and will help ensure their safety at school.\n\nShould you have any questions, please contact the school health team.\n\nThank you.\nEpiSafe School Health Team`
  }

  function rejectionMessage(l, reason) {
    return `Dear ${l.emergency_contact_name || 'Parent/Guardian'},\n\nWe regret to inform you that ${l.full_name}'s health registration on EpiSafe School could not be approved at this time.\n\nReason: ${reason}\n\nPlease contact the school health team for further assistance or to re-register.\n\nThank you.\nEpiSafe School Health Team`
  }

  const riskColor = r => r === 'High' ? '#ff4d4f' : r === 'Moderate' ? '#fa8c16' : '#3ECF8E'

  return (
    <div>
      <h1>⏳ Pending Approvals</h1>
      <p style={{ marginBottom: '24px' }}>Review learner self-registrations and approve or reject them.</p>

      {/* Rejection Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: '6px', color: '#1a1a2e' }}>❌ Reject Registration</h2>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              Rejecting <strong>{rejectModal.full_name}</strong>. Select a reason to notify the parent/guardian.
            </p>
            <div className="form-group">
              <label>Reason for rejection</label>
              <select value={selectedReason} onChange={e => { setSelectedReason(e.target.value); setCustomReason('') }}>
                <option value="">-- Select a reason --</option>
                {rejectionReasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                <option value="custom">Other — type custom reason</option>
              </select>
            </div>
            {selectedReason === 'custom' && (
              <div className="form-group">
                <label>Custom reason</label>
                <textarea rows={3} value={customReason} onChange={e => setCustomReason(e.target.value)} placeholder="Type your reason here..." />
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setRejectModal(null); setSelectedReason(''); setCustomReason('') }}>
                Cancel
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmReject}>
                ❌ Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recently Approved */}
      {Object.values(approved).length > 0 && (
        <div className="card" style={{ background: '#e6fff5', border: '1px solid #3ECF8E', marginBottom: '16px' }}>
          <h2 style={{ color: '#0F6E56', marginBottom: '12px' }}>✅ Recently Approved — Send Notification</h2>
          {Object.values(approved).map(l => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(62,207,142,0.2)', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>{l.full_name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{l.emergency_contact_name} · {l.emergency_contact_phone}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ background: '#25D366', color: 'white', padding: '8px 14px', fontSize: '12px' }}
                  onClick={() => sendWhatsApp(l, approvalMessage(l))}>
                  💬 WhatsApp
                </button>
                <button className="btn" style={{ background: '#4096ff', color: 'white', padding: '8px 14px', fontSize: '12px' }}
                  onClick={() => sendEmail(l, `EpiSafe Registration Approved — ${l.full_name}`, approvalMessage(l))}>
                  📧 Email
                </button>
                <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}
                  onClick={() => dismissApproved(l.id)}>
                  ✖️ Don't send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recently Rejected */}
      {Object.values(rejected).length > 0 && (
        <div className="card" style={{ background: '#fff1f0', border: '1px solid #ffccc7', marginBottom: '16px' }}>
          <h2 style={{ color: '#A32D2D', marginBottom: '12px' }}>❌ Recently Rejected — Send Notification</h2>
          {Object.values(rejected).map(l => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,77,79,0.15)', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>{l.full_name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{l.emergency_contact_name} · {l.emergency_contact_phone}</div>
                <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '2px' }}>Reason: {l.reason}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ background: '#25D366', color: 'white', padding: '8px 14px', fontSize: '12px' }}
                  onClick={() => sendWhatsApp(l, rejectionMessage(l, l.reason))}>
                  💬 WhatsApp
                </button>
                <button className="btn" style={{ background: '#4096ff', color: 'white', padding: '8px 14px', fontSize: '12px' }}
                  onClick={() => sendEmail(l, `EpiSafe Registration Update — ${l.full_name}`, rejectionMessage(l, l.reason))}>
                  📧 Email
                </button>
                <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}
                  onClick={() => dismissRejected(l.id)}>
                  ✖️ Don't send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending List */}
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
                  <div style={{ fontSize: '12px', color: '#666' }}><strong>Contact:</strong> {l.emergency_contact_name || '—'} · {l.emergency_contact_phone || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button className="btn btn-primary" onClick={() => approve(l)}>✅ Approve</button>
                <button className="btn btn-danger" onClick={() => setRejectModal(l)}>❌ Reject</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Pending