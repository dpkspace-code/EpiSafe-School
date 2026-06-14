import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const rejectionReasons = [
  'Incomplete information provided — please re-register with full details',
  'Duplicate registration — a profile already exists for this staff member',
  'Information could not be verified — please visit the school health office',
  'Not a registered staff member at this school',
  'Medical details require further clarification — please visit the school health office',
  'Staff member has no risk and is episafe',
]

function StaffPending() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [approved, setApproved] = useState({})
  const [rejectModal, setRejectModal] = useState(null) // single staff member OR 'bulk'
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [rejected, setRejected] = useState({})
  const [selected, setSelected] = useState(new Set())

  useEffect(() => { fetchPending() }, [])

  async function fetchPending() {
    setLoading(true)
    const { data } = await supabase
      .from('staff_registry').select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setPending(data || [])
    setSelected(new Set())
    setLoading(false)
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === pending.length) setSelected(new Set())
    else setSelected(new Set(pending.map(s => s.id)))
  }

  async function approve(staff) {
    await supabase.from('staff_registry').update({ status: 'active' }).eq('id', staff.id)
    setApproved(prev => ({ ...prev, [staff.id]: staff }))
    fetchPending()
  }

  async function approveSelected() {
    const ids = [...selected]
    await supabase.from('staff_registry').update({ status: 'active' }).in('id', ids)
    const approvedStaff = pending.filter(s => ids.includes(s.id))
    setApproved(prev => {
      const next = { ...prev }
      approvedStaff.forEach(s => { next[s.id] = s })
      return next
    })
    fetchPending()
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selected.size} selected record(s)? This cannot be undone.`)) return
    await supabase.from('staff_registry').delete().in('id', [...selected])
    fetchPending()
  }

  async function deleteAll() {
    if (!confirm(`Delete ALL ${pending.length} pending record(s)? This cannot be undone.`)) return
    await supabase.from('staff_registry').delete().in('id', pending.map(s => s.id))
    fetchPending()
  }

  async function deleteAccount(userId) {
    if (!userId) {
      return alert("No account ID found for this record (it was registered before this feature was added). You can still delete it manually from Supabase > Authentication > Users.")
    }
    if (!confirm('This will permanently delete the login account for this person. They will need to create a new account to register again. Continue?')) return
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId, managerCode: 'EPISAFE2025' }
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      alert('✅ Account deleted successfully.')
    } catch (err) {
      alert('Error deleting account: ' + err.message)
    }
  }

  async function confirmReject() {
    if (!selectedReason && !customReason) return alert('Please select or enter a reason')
    const reason = customReason || selectedReason

    if (rejectModal === 'bulk') {
      const ids = [...selected]
      const rejectedStaff = pending.filter(s => ids.includes(s.id))
      await supabase.from('staff_registry').delete().in('id', ids)
      setRejected(prev => {
        const next = { ...prev }
        rejectedStaff.forEach(s => { next[s.id] = { ...s, reason } })
        return next
      })
    } else {
      const staff = rejectModal
      await supabase.from('staff_registry').delete().eq('id', staff.id)
      setRejected(prev => ({ ...prev, [staff.id]: { ...staff, reason } }))
    }

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

  function sendWhatsApp(staff, message) {
    const phone = staff.emergency_contact_phone?.replace(/\s/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  function sendEmail(staff, subject, message) {
    const to = staff.emergency_contact_email || ''
    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank')
  }

  function approvalMessage(s) {
    return `Dear ${s.emergency_contact_name || 'Emergency Contact'},\n\nWe are pleased to inform you that ${s.full_name}'s health registration on EpiSafe School has been APPROVED by the school health team.\n\nTheir health profile is now active in our system and will help ensure their safety at school.\n\nShould you have any questions, please contact the school health team.\n\nThank you.\nEpiSafe School Health Team`
  }

  function rejectionMessage(s, reason) {
    return `Dear ${s.emergency_contact_name || 'Emergency Contact'},\n\nWe regret to inform you that ${s.full_name}'s health registration on EpiSafe School could not be approved at this time.\n\nReason: ${reason}\n\nPlease contact the school health team for further assistance or to re-register.\n\nThank you.\nEpiSafe School Health Team`
  }

  const riskColor = r => r === 'High' ? '#ff4d4f' : r === 'Moderate' ? '#fa8c16' : r === 'Low-Moderate' ? '#fadb14' : '#3ECF8E'
  const vulnScores = { High: 9, Moderate: 6, 'Low-Moderate': 4, Low: 2 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <div>
          <h1>⏳ Staff Pending Approvals</h1>
          <p>Review staff self-registrations and approve or reject them.</p>
        </div>
        {pending.length > 0 && (
          <button className="btn btn-danger" onClick={deleteAll}>
            🗑️ Delete All ({pending.length})
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="card" style={{ background: '#f0f4f8', border: '1px solid #ddd', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#333' }}>
            {selected.size} selected
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={approveSelected}>✅ Approve Selected</button>
            <button className="btn btn-danger" style={{ background: '#fa8c16' }} onClick={() => setRejectModal('bulk')}>❌ Reject Selected</button>
            <button className="btn btn-danger" onClick={deleteSelected}>🗑️ Delete Selected</button>
            <button className="btn btn-secondary" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: '6px', color: '#1a1a2e' }}>❌ Reject Registration{rejectModal === 'bulk' ? 's' : ''}</h2>
            <p style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '16px' }}>
              {rejectModal === 'bulk'
                ? <>Rejecting <strong>{selected.size}</strong> selected staff member(s). Select a reason to notify their emergency contact.</>
                : <>Rejecting <strong>{rejectModal.full_name}</strong>. Select a reason to notify the emergency contact.</>}
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
          {Object.values(approved).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(62,207,142,0.2)', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.875rem' }}>{s.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>{s.emergency_contact_name} · {s.emergency_contact_phone}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ background: '#25D366', color: 'white', padding: '8px 14px', fontSize: '0.75rem' }}
                  onClick={() => sendWhatsApp(s, approvalMessage(s))}>
                  💬 WhatsApp
                </button>
                <button className="btn" style={{ background: '#4096ff', color: 'white', padding: '8px 14px', fontSize: '0.75rem' }}
                  onClick={() => sendEmail(s, `EpiSafe Registration Approved — ${s.full_name}`, approvalMessage(s))}>
                  📧 Email
                </button>
                <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                  onClick={() => dismissApproved(s.id)}>
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
          {Object.values(rejected).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,77,79,0.15)', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.875rem' }}>{s.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>{s.emergency_contact_name} · {s.emergency_contact_phone}</div>
                <div style={{ fontSize: '0.6875rem', color: '#ff4d4f', marginTop: '2px' }}>Reason: {s.reason}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ background: '#25D366', color: 'white', padding: '8px 14px', fontSize: '0.75rem' }}
                  onClick={() => sendWhatsApp(s, rejectionMessage(s, s.reason))}>
                  💬 WhatsApp
                </button>
                <button className="btn" style={{ background: '#4096ff', color: 'white', padding: '8px 14px', fontSize: '0.75rem' }}
                  onClick={() => sendEmail(s, `EpiSafe Registration Update — ${s.full_name}`, rejectionMessage(s, s.reason))}>
                  📧 Email
                </button>
                <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                  onClick={() => dismissRejected(s.id)}>
                  ✖️ Don't send
                </button>
                <button className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                  onClick={() => deleteAccount(s.user_id)}>
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending List */}
      {loading ? <p>Loading...</p> : pending.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2>All caught up!</h2>
          <p style={{ color: '#888' }}>No pending staff registrations to review.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '0 4px' }}>
            <input
              type="checkbox"
              checked={selected.size === pending.length}
              onChange={toggleSelectAll}
              style={{ width: 'auto', margin: 0 }}
            />
            <span style={{ fontSize: '0.8125rem', color: '#666' }}>Select all</span>
          </div>

          {pending.map(s => (
            <div key={s.id} className="card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    style={{ width: 'auto', margin: 0, marginTop: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h2 style={{ fontSize: '1rem' }}>{s.full_name}</h2>
                      {s.risk_level && (
                        <span style={{ background: riskColor(s.risk_level) + '22', color: riskColor(s.risk_level), border: `1px solid ${riskColor(s.risk_level)}44`, borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: '600' }}>
                          Vulnerability: {s.risk_level} ({vulnScores[s.risk_level] ?? '—'}/10)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}><strong>Staff Type:</strong> {s.staff_type || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}><strong>Department:</strong> {s.department || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}><strong>Has Seizures:</strong> {s.has_seizures || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}><strong>Seizure Type:</strong> {s.seizure_type || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}><strong>Medication:</strong> {s.medication || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}><strong>Contact:</strong> {s.emergency_contact_name || '—'} · {s.emergency_contact_phone || '—'}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => approve(s)}>✅ Approve</button>
                  <button className="btn btn-danger" onClick={() => setRejectModal(s)}>❌ Reject</button>
                  <button className="btn btn-secondary" onClick={() => deleteAccount(s.user_id)}>🗑️ Delete Account</button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default StaffPending