import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function MedicalReferral({ onClose }) {
  const [learners, setLearners] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('learners')

  useEffect(() => { fetchFlagged() }, [])

  async function fetchFlagged() {
    setLoading(true)
    const { data: l } = await supabase.from('learners').select('*').eq('referral_flagged', true).order('referral_date', { ascending: false })
    const { data: s } = await supabase.from('staff_registry').select('*').eq('referral_flagged', true).order('referral_date', { ascending: false })
    setLearners(l || [])
    setStaff(s || [])
    setLoading(false)
  }

  async function unflag(table, id) {
    if (!confirm('Remove referral flag for this person?')) return
    await supabase.from(table).update({ referral_flagged: false, referral_note: null, referral_date: null }).eq('id', id)
    fetchFlagged()
  }

  function printReferral(person, type) {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    const refId = `REF-${Date.now().toString().slice(-6)}`
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html><head><title>Medical Referral — ${person.full_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 50px; color: #1a1a2e; font-size: 13px; }
        .header { border-bottom: 3px solid #5B21B6; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
        .header h1 { font-size: 20px; color: #5B21B6; }
        .header p { font-size: 11px; color: #888; margin-top: 4px; }
        .ref-id { font-size: 11px; color: #888; text-align: right; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 13px; font-weight: 700; color: #5B21B6; border-bottom: 1px solid #e8e4f8; padding-bottom: 4px; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .field { background: #f5f3ff; border-radius: 6px; padding: 8px 12px; }
        .label { font-size: 10px; color: #888; text-transform: uppercase; }
        .value { font-weight: 600; font-size: 13px; margin-top: 2px; }
        .reason-box { background: #fff1f0; border: 1px solid #ffccc7; border-radius: 8px; padding: 14px; margin: 16px 0; }
        .reason-box h3 { color: #A32D2D; font-size: 12px; margin-bottom: 6px; }
        .reason-box p { font-size: 12px; color: #666; line-height: 1.6; }
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
        .sig-line { border-top: 1px solid #333; padding-top: 6px; font-size: 11px; color: #666; margin-top: 40px; }
        .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; font-size: 10px; color: #aaa; display: flex; justify-content: space-between; }
        .urgent { background: #fff1f0; border: 2px solid #ff4d4f; border-radius: 8px; padding: 10px 16px; text-align: center; color: #A32D2D; font-weight: 700; font-size: 13px; margin-bottom: 20px; }
        @media print { .no-print { display: none; } }
      </style></head><body>

      <div class="no-print" style="text-align:right; margin-bottom:20px;">
        <button onclick="window.print()" style="background:#5B21B6;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;">🖨️ Print / Save as PDF</button>
      </div>

      <div class="header">
        <div>
          <h1>🧠 EpiSafe School — Medical Referral Letter</h1>
          <p>Epilepsy Management for Secondary Schools: MAURITIUS</p>
        </div>
        <div class="ref-id">
          <strong>Ref: ${refId}</strong><br/>
          Date: ${today}
        </div>
      </div>

      ${person.risk_level === 'High' || person.action_plan === 'High' ? '<div class="urgent">⚠️ URGENT — HIGH RISK CASE</div>' : ''}

      <p style="margin-bottom:20px; line-height:1.7;">
        To Whom It May Concern,<br/><br/>
        This letter serves as a formal medical referral from <strong>EpiSafe School</strong> for the individual named below, 
        who has been identified through our school epilepsy management screening programme as requiring medical evaluation 
        by a qualified physician or neurologist.
      </p>

      <div class="section">
        <h2>Individual Details</h2>
        <div class="grid">
          <div class="field"><div class="label">Full Name</div><div class="value">${person.full_name || '—'}</div></div>
          <div class="field"><div class="label">Type</div><div class="value">${type === 'learner' ? `Learner — ${person.grade || '—'}` : `Staff — ${person.staff_type || '—'}`}</div></div>
          <div class="field"><div class="label">Seizure Type</div><div class="value">${person.seizure_type || '—'}</div></div>
          <div class="field"><div class="label">Current Medication</div><div class="value">${person.medication || '—'}</div></div>
          <div class="field"><div class="label">Known Triggers</div><div class="value">${person.triggers || '—'}</div></div>
          <div class="field"><div class="label">Risk / Vulnerability Level</div><div class="value">${person.risk_level || person.action_plan || '—'}</div></div>
          <div class="field"><div class="label">Emergency Contact</div><div class="value">${person.emergency_contact_name || '—'}</div></div>
          <div class="field"><div class="label">Emergency Phone</div><div class="value">${person.emergency_contact_phone || '—'}</div></div>
        </div>
      </div>

      <div class="reason-box">
        <h3>⚕️ Reason for Referral</h3>
        <p>${person.referral_note || 'Flagged for medical evaluation based on screening results and risk level assessment.'}</p>
      </div>

      <div class="section">
        <h2>Recommended Actions</h2>
        <p style="line-height:1.8; font-size:12px;">
          1. Full neurological assessment and review of current anti-epileptic therapy.<br/>
          2. Review of seizure frequency and medication dosage if applicable.<br/>
          3. Provision of updated medical documentation to the school for action plan review.<br/>
          4. Any recommendations regarding school activities, sports participation, or special accommodations.
        </p>
      </div>

      <div class="sig-grid">
        <div>
          <div class="sig-line">Referred by: ___________________________</div>
          <div class="sig-line" style="margin-top:8px;">Designation: ___________________________</div>
        </div>
        <div>
          <div class="sig-line">School Stamp / Signature</div>
          <div class="sig-line" style="margin-top:8px;">Date: ${today}</div>
        </div>
      </div>

      <div class="footer">
        <span>EpiSafe School — Epilepsy Management for Secondary Schools: MAURITIUS</span>
        <span>Ref: ${refId}</span>
      </div>
      </body></html>
    `)
    win.document.close()
  }

  const riskColor = (r) => r === 'High' ? '#ff4d4f' : r === 'Moderate' ? '#fa8c16' : '#3ECF8E'

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '16px', overflowY: 'auto',
    }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '700px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', margin: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#A32D2D' }}>⚕️ Medical Referrals</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'learners', label: `📚 Learners (${learners.length})` },
            { key: 'staff', label: `🧑‍🏫 Staff (${staff.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500',
              background: tab === t.key ? '#A32D2D' : '#f0f4f8',
              color: tab === t.key ? 'white' : '#666',
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>Loading...</p> : (
          <>
            {tab === 'learners' && (
              learners.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>No learners flagged for medical referral yet.</p>
              ) : learners.map(l => (
                <div key={l.id} style={{ border: '1px solid #ffccc7', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', background: '#fff9f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.9375rem' }}>{l.full_name}</strong>
                      <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#888' }}>{l.grade}</span>
                      {(l.risk_level || l.action_plan) && (
                        <span style={{ marginLeft: '8px', fontSize: '0.75rem', fontWeight: '700', color: riskColor(l.risk_level || l.action_plan) }}>
                          ● {l.risk_level || l.action_plan}
                        </span>
                      )}
                      <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '4px' }}>{l.seizure_type || '—'} · {l.medication || '—'}</div>
                      {l.referral_note && <div style={{ fontSize: '0.8125rem', color: '#A32D2D', marginTop: '4px' }}>📝 {l.referral_note}</div>}
                      {l.referral_date && <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>Flagged: {new Date(l.referral_date).toLocaleDateString('en-GB')}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => printReferral(l, 'learner')}>🖨️ Letter</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => unflag('learners', l.id)}>Remove Flag</button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {tab === 'staff' && (
              staff.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>No staff flagged for medical referral yet.</p>
              ) : staff.map(s => (
                <div key={s.id} style={{ border: '1px solid #ffccc7', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', background: '#fff9f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.9375rem' }}>{s.full_name}</strong>
                      <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#888' }}>{s.staff_type}</span>
                      {s.risk_level && (
                        <span style={{ marginLeft: '8px', fontSize: '0.75rem', fontWeight: '700', color: riskColor(s.risk_level) }}>
                          ● {s.risk_level}
                        </span>
                      )}
                      <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '4px' }}>{s.seizure_type || '—'} · {s.medication || '—'}</div>
                      {s.referral_note && <div style={{ fontSize: '0.8125rem', color: '#A32D2D', marginTop: '4px' }}>📝 {s.referral_note}</div>}
                      {s.referral_date && <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>Flagged: {new Date(s.referral_date).toLocaleDateString('en-GB')}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => printReferral(s, 'staff')}>🖨️ Letter</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => unflag('staff_registry', s.id)}>Remove Flag</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default MedicalReferral
