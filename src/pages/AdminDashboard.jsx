import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function AdminDashboard({ tab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(tab)
  const [schools, setSchools] = useState([])
  const [stats, setStats] = useState({ schools: 0, learners: 0, staff: 0, screenings: 0, highRisk: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)

    const { data: schoolData } = await supabase
      .from('schools').select('*').order('created_at', { ascending: false })

    const { count: lCount } = await supabase
      .from('learners').select('*', { count: 'exact', head: true }).eq('status', 'active')

    const { count: sCount } = await supabase
      .from('staff_registry').select('*', { count: 'exact', head: true }).eq('status', 'active')

    const { count: scCount } = await supabase
      .from('screener_responses').select('*', { count: 'exact', head: true })

    const { count: hCount } = await supabase
      .from('screener_responses').select('*', { count: 'exact', head: true }).eq('risk_level', 'High')

    // For each school get learner and staff counts
    const enriched = await Promise.all((schoolData || []).map(async school => {
      const { count: lc } = await supabase.from('learners').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('status', 'active')
      const { count: sc } = await supabase.from('staff_registry').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('status', 'active')
      const { count: pc } = await supabase.from('learners').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('status', 'pending')
      return { ...school, learnerCount: lc || 0, staffCount: sc || 0, pendingCount: pc || 0 }
    }))

    setSchools(enriched)
    setStats({
      schools: schoolData?.length || 0,
      learners: lCount || 0,
      staff: sCount || 0,
      screenings: scCount || 0,
      highRisk: hCount || 0
    })
    setLoading(false)
  }

  async function deleteSchool(schoolId, schoolName) {
    if (!confirm(`Remove ${schoolName}'s registration? Their data will remain but be unlinked. Continue?`)) return
    await supabase.from('schools').delete().eq('id', schoolId)
    fetchAll()
  }

  const zoneColor = { 'Zone 1': '#185FA5', 'Zone 2': '#3B6D11', 'Zone 3': '#854F0B', 'Zone 4': '#5B21B6' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <img src="/episafe_icon_512.png" alt="EpiSafe" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <span style={{ fontSize: '0.75rem', background: '#5B21B6', color: 'white', padding: '2px 10px', borderRadius: '10px', fontWeight: '700' }}>SUPER ADMIN</span>
        </div>
      </div>
      <p style={{ marginBottom: '24px', color: '#888' }}>Full oversight of all schools and registries</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'dashboard', label: '📊 Overview' },
          { key: 'schools', label: `🏫 Schools (${stats.schools})` },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500',
            background: activeTab === t.key ? '#5B21B6' : '#f0f4f8',
            color: activeTab === t.key ? 'white' : '#666',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
            <div className="stat-card"><div className="stat-number" style={{ color: '#5B21B6' }}>{stats.schools}</div><div className="stat-label">Schools Registered</div></div>
            <div className="stat-card"><div className="stat-number">{stats.learners}</div><div className="stat-label">Total Learners</div></div>
            <div className="stat-card"><div className="stat-number">{stats.staff}</div><div className="stat-label">Total Staff</div></div>
            <div className="stat-card"><div className="stat-number">{stats.screenings}</div><div className="stat-label">Total Screenings</div></div>
            <div className="stat-card"><div className="stat-number" style={{ color: '#ff4d4f' }}>{stats.highRisk}</div><div className="stat-label">High Risk Cases</div></div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>🗺️ Schools by Zone</h2>
            {['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'].map(zone => {
              const zoneSchools = schools.filter(s => s.zone === zone)
              return (
                <div key={zone} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <span style={{ color: zoneColor[zone] || '#333', fontWeight: '600' }}>{zone}</span>
                    <span style={{ color: '#888' }}>{zoneSchools.length} school{zoneSchools.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ background: '#f0f4f8', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${schools.length > 0 ? (zoneSchools.length / schools.length) * 100 : 0}%`, background: zoneColor[zone] || '#3ECF8E', height: '100%', borderRadius: '4px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {activeTab === 'schools' && (
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>🏫 Registered Schools & Managers</h2>
          {loading ? <p>Loading...</p> : schools.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No schools registered yet. Schools appear here when managers sign up.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Zone</th>
                    <th>Manager Email</th>
                    <th>Learners</th>
                    <th>Staff</th>
                    <th>Pending</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.school_name}</strong></td>
                      <td><span style={{ fontSize: '0.75rem', fontWeight: '600', color: zoneColor[s.zone] || '#888' }}>{s.zone || '—'}</span></td>
                      <td style={{ fontSize: '0.8125rem', color: '#555' }}>{s.manager_email || '—'}</td>
                      <td><span style={{ fontWeight: '700', color: '#185FA5' }}>{s.learnerCount}</span></td>
                      <td><span style={{ fontWeight: '700', color: '#3B6D11' }}>{s.staffCount}</span></td>
                      <td>{s.pendingCount > 0 ? <span style={{ fontWeight: '700', color: '#fa8c16' }}>{s.pendingCount}</span> : <span style={{ color: '#aaa' }}>0</span>}</td>
                      <td style={{ fontSize: '0.75rem', color: '#aaa' }}>{new Date(s.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => deleteSchool(s.id, s.school_name)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
