import { useState } from 'react'
import { supabase } from '../supabase'

const vulnColors = { High: '#ff4d4f', Moderate: '#fa8c16', 'Low-Moderate': '#fadb14', Low: '#3ECF8E' }

function ReportGenerator({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('all') // 'all', 'learners', 'staff'
  const [minRisk, setMinRisk] = useState('Moderate') // 'Moderate', 'High'
  const [authority, setAuthority] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [school, setSchool] = useState('')
  const [zone, setZone] = useState('')

  async function generateReport() {
    if (!preparedBy) return alert('Please enter your name as the report preparer.')
    setLoading(true)

    const riskLevels = minRisk === 'High' ? ['High'] : ['High', 'Moderate']

    // Fetch learners
    let learners = []
    if (reportType === 'all' || reportType === 'learners') {
      const { data } = await supabase
        .from('learners')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      learners = (data || [])
    }

    // Fetch staff
    let staffList = []
    if (reportType === 'all' || reportType === 'staff') {
      const { data } = await supabase
        .from('staff_registry')
        .select('*')
        .eq('status', 'active')
        .in('risk_level', riskLevels)
        .order('created_at', { ascending: false })
      staffList = data || []
    }

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    const reportId = `ESR-${Date.now().toString().slice(-6)}`

    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>EpiSafe Report ${reportId}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; font-size: 13px; }
          
          .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #5B21B6; padding-bottom: 20px; margin-bottom: 24px; }
          .header-left h1 { font-size: 22px; color: #5B21B6; }
          .header-left h2 { font-size: 13px; font-weight: normal; color: #666; margin-top: 4px; }
          .header-right { text-align: right; font-size: 11px; color: #888; }
          .header-right strong { display: block; font-size: 13px; color: #1a1a2e; }

          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
          .meta-box { background: #f5f3ff; border: 1px solid #ddd8f7; border-radius: 8px; padding: 12px; }
          .meta-box .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta-box .value { font-size: 13px; font-weight: 600; color: #1a1a2e; margin-top: 2px; }

          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 28px; }
          .stat { background: #1a1a2e; color: white; border-radius: 10px; padding: 14px; text-align: center; }
          .stat .num { font-size: 26px; font-weight: 700; }
          .stat .lbl { font-size: 10px; opacity: 0.7; margin-top: 2px; }
          .stat.red { background: #A32D2D; }
          .stat.orange { background: #854F0B; }
          .stat.purple { background: #5B21B6; }

          .section-title { font-size: 15px; font-weight: 700; color: #5B21B6; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #e8e4f8; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11.5px; }
          th { background: #1a1a2e; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
          td { padding: 7px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
          tr:nth-child(even) td { background: #fafafa; }
          tr:hover td { background: #f5f3ff; }

          .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
          .badge-high { background: #fff1f0; color: #A32D2D; border: 1px solid #ffccc7; }
          .badge-moderate { background: #fff7e6; color: #854F0B; border: 1px solid #ffe58f; }
          .badge-low-moderate { background: #feffe6; color: #5c6b00; border: 1px solid #eaff8f; }

          .no-data { text-align: center; padding: 30px; color: #aaa; font-style: italic; }

          .referral-box { background: #fff1f0; border: 1px solid #ffccc7; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
          .referral-box h3 { color: #A32D2D; margin-bottom: 8px; font-size: 13px; }
          .referral-box p { font-size: 12px; color: #666; line-height: 1.6; }

          .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
          .sig-line { border-top: 1px solid #333; padding-top: 6px; font-size: 11px; color: #666; margin-top: 40px; }

          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #aaa; display: flex; justify-content: space-between; }

          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>

        <!-- PRINT BUTTON -->
        <div class="no-print" style="text-align:right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background:#5B21B6; color:white; border:none; padding:10px 24px; border-radius:8px; font-size:14px; cursor:pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <!-- HEADER -->
        <div class="header">
          <div class="header-left">
            <h1>🧠 EpiSafe School</h1>
            <h2>Epilepsy Vulnerability Report — ${minRisk === 'High' ? 'High Risk Cases Only' : 'Moderate to High Risk Cases'}</h2>
          </div>
          <div class="header-right">
            <strong>Report ID: ${reportId}</strong>
            Date: ${today}<br/>
            Prepared by: ${preparedBy}<br/>
            ${school ? `School: ${school}<br/>` : ''}
            ${zone ? `Zone: ${zone}<br/>` : ''}
            ${authority ? `Submitted to: ${authority}` : ''}
          </div>
        </div>

        <!-- SUMMARY STATS -->
        <div class="summary-grid">
          <div class="stat purple">
            <div class="num">${learners.length + staffList.length}</div>
            <div class="lbl">Total Cases</div>
          </div>
          <div class="stat red">
            <div class="num">${[...learners, ...staffList].filter(r => r.risk_level === 'High' || r.action_plan === 'High').length}</div>
            <div class="lbl">High Risk</div>
          </div>
          <div class="stat orange">
            <div class="num">${[...learners, ...staffList].filter(r => r.risk_level === 'Moderate' || r.action_plan === 'Moderate').length}</div>
            <div class="lbl">Moderate Risk</div>
          </div>
          <div class="stat">
            <div class="num">${learners.length}</div>
            <div class="lbl">Learners · ${staffList.length} Staff</div>
          </div>
        </div>

        <!-- REFERRAL NOTE -->
        ${[...learners, ...staffList].filter(r => r.risk_level === 'High' || r.action_plan === 'High').length > 0 ? `
        <div class="referral-box">
          <h3>⚠️ Medical Referral Recommended</h3>
          <p>The following report contains <strong>${[...learners, ...staffList].filter(r => r.risk_level === 'High' || r.action_plan === 'High').length} high-risk individual(s)</strong> who may require urgent medical evaluation by a neurologist or general practitioner. It is recommended that the school administration liaise with the Ministry of Health and Wellness and the relevant educational zone authority to ensure appropriate medical follow-up is arranged.</p>
        </div>` : ''}

        <!-- LEARNERS TABLE -->
        ${(reportType === 'all' || reportType === 'learners') ? `
        <div class="section-title">📚 Learners — ${learners.length} Active Case${learners.length !== 1 ? 's' : ''}</div>
        ${learners.length === 0 ? '<p class="no-data">No learner cases found.</p>' : `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Grade</th>
              <th>Seizure Type</th>
              <th>Medication</th>
              <th>Triggers</th>
              <th>Emergency Contact</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${learners.map((l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${l.full_name || '—'}</strong></td>
                <td>${l.grade || '—'}</td>
                <td>${l.seizure_type || '—'}</td>
                <td>${l.medication || '—'}</td>
                <td>${l.triggers || '—'}</td>
                <td>${l.emergency_contact_name || '—'}</td>
                <td>${l.emergency_contact_phone || '—'}</td>
                <td><span class="badge badge-${(l.status || '').toLowerCase()}">${l.status || '—'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>`}` : ''}

        <!-- STAFF TABLE -->
        ${(reportType === 'all' || reportType === 'staff') ? `
        <div class="section-title">🧑‍🏫 Staff — ${staffList.length} Case${staffList.length !== 1 ? 's' : ''} (${minRisk === 'High' ? 'High' : 'Moderate to High'} Risk)</div>
        ${staffList.length === 0 ? '<p class="no-data">No staff cases matching the selected risk level.</p>' : `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Staff Type</th>
              <th>Department</th>
              <th>Seizure Type</th>
              <th>Medication</th>
              <th>Risk Level</th>
              <th>Emergency Contact</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            ${staffList.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${s.full_name || '—'}</strong></td>
                <td>${s.staff_type || '—'}</td>
                <td>${s.department || '—'}</td>
                <td>${s.seizure_type || '—'}</td>
                <td>${s.medication || '—'}</td>
                <td><span class="badge badge-${(s.risk_level || '').toLowerCase().replace(' ', '-')}">${s.risk_level || '—'}</span></td>
                <td>${s.emergency_contact_name || '—'}</td>
                <td>${s.emergency_contact_phone || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`}` : ''}

        <!-- SIGNATURE SECTION -->
        <div class="signature-grid">
          <div>
            <div class="sig-line">Prepared by: ${preparedBy}</div>
            <div class="sig-line" style="margin-top: 8px;">Designation: ___________________________</div>
          </div>
          <div>
            <div class="sig-line">Received by: ___________________________</div>
            <div class="sig-line" style="margin-top: 8px;">Date received: ___________________________</div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <span>EpiSafe School — Epilepsy Management for Secondary Schools: MAURITIUS</span>
          <span>Report ID: ${reportId} · Generated: ${today}</span>
        </div>

      </body>
      </html>
    `)
    win.document.close()
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '16px', overflowY: 'auto',
    }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', margin: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: '#5B21B6' }}>📄 Generate Authority Report</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        <div className="form-group">
          <label>Report Covers</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)}>
            <option value="all">All Active Cases (Learners + Staff)</option>
            <option value="learners">Learners Only</option>
            <option value="staff">Staff Only</option>
          </select>
        </div>

        <div className="form-group">
          <label>Minimum Risk Level to Include</label>
          <select value={minRisk} onChange={e => setMinRisk(e.target.value)}>
            <option value="Moderate">Moderate & High Risk</option>
            <option value="High">High Risk Only</option>
          </select>
        </div>

        <div className="form-group">
          <label>Prepared By (Your Name) *</label>
          <input value={preparedBy} onChange={e => setPreparedBy(e.target.value)} placeholder="e.g. Mr. D. Ramkhelawon" />
        </div>

        <div className="form-group">
          <label>School Name</label>
          <input value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Curepipe College" />
        </div>

        <div className="form-group">
          <label>Zone</label>
          <select value={zone} onChange={e => setZone(e.target.value)}>
            <option value="">-- Select zone --</option>
            <option value="Zone 1 — Port Louis & North">Zone 1 — Port Louis & North</option>
            <option value="Zone 2 — East & Central">Zone 2 — East & Central</option>
            <option value="Zone 3 — South & South East">Zone 3 — South & South East</option>
            <option value="Zone 4 — West & Highlands">Zone 4 — West & Highlands</option>
          </select>
        </div>

        <div className="form-group">
          <label>Submit To (Authority)</label>
          <input value={authority} onChange={e => setAuthority(e.target.value)} placeholder="e.g. Ministry of Education, Zone Education Officer" />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2, background: '#5B21B6' }} onClick={generateReport} disabled={loading}>
            {loading ? 'Generating...' : '📄 Generate Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportGenerator
