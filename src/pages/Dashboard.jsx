import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Dashboard({ setPage }) {
  const [learnerCount, setLearnerCount] = useState(0)
  const [screeningCount, setScreeningCount] = useState(0)
  const [highRiskCount, setHighRiskCount] = useState(0)
  const [seizureData, setSeizureData] = useState([])
  const [zoneData, setZoneData] = useState([])

  useEffect(() => {
    async function fetchStats() {
      const { count: lCount } = await supabase.from('learners').select('*', { count: 'exact', head: true })
      const { count: sCount } = await supabase.from('screener_responses').select('*', { count: 'exact', head: true })
      const { count: hCount } = await supabase.from('screener_responses').select('*', { count: 'exact', head: true }).eq('risk_level', 'High')
      const { data: learners } = await supabase.from('learners').select('seizure_type, triggers')

      setLearnerCount(lCount || 0)
      setScreeningCount(sCount || 0)
      setHighRiskCount(hCount || 0)

      if (learners) {
        const seizureCounts = {}
        learners.forEach(l => {
          if (l.seizure_type) {
            seizureCounts[l.seizure_type] = (seizureCounts[l.seizure_type] || 0) + 1
          }
        })
        setSeizureData(Object.entries(seizureCounts).map(([name, count]) => ({ name, count })))

        const zoneCounts = {}
        learners.forEach(l => {
          if (l.triggers) {
            zoneCounts[l.triggers] = (zoneCounts[l.triggers] || 0) + 1
          }
        })
        setZoneData(Object.entries(zoneCounts).map(([name, count]) => ({ name, count })))
      }
    }
    fetchStats()
  }, [])

  const colors = ['#3ECF8E', '#185FA5', '#BA7517', '#A32D2D', '#3B6D11', '#993556']

  function BarChart({ data, title, emptyMsg }) {
    const max = Math.max(...data.map(d => d.count), 1)
    return (
      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>{title}</h2>
        {data.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>{emptyMsg}</p>
        ) : (
          data.map((d, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#333' }}>{d.name}</span>
                <span style={{ fontWeight: '500', color: colors[i % colors.length] }}>{d.count}</span>
              </div>
              <div style={{ background: '#f0f4f8', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${(d.count / max) * 100}%`, background: colors[i % colors.length], height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div>
      <h1>🧠 EpiSafe School</h1>
      <p style={{ marginBottom: '24px' }}>Epilepsy management dashboard</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{learnerCount}</div>
          <div className="stat-label">Learners in Registry</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{screeningCount}</div>
          <div className="stat-label">Screenings Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ff4d4f' }}>{highRiskCount}</div>
          <div className="stat-label">High Risk Flagged</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <BarChart data={seizureData} title="📊 Seizure Types" emptyMsg="No learner data yet" />
        <BarChart data={zoneData} title="⚡ Common Triggers" emptyMsg="No trigger data yet" />
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setPage('screener')}>📋 New Screening</button>
          <button className="btn btn-primary" onClick={() => setPage('registry')}>➕ Add Learner</button>
          <button className="btn btn-secondary" onClick={() => setPage('guides')}>📖 View Guides</button>
        </div>
      </div>

      <div className="card">
        <h2>About EpiSafe</h2>
        <p style={{ lineHeight: '1.7' }}>
          EpiSafe helps schools identify learners at risk of seizures, maintain a secure epilepsy registry,
          and equip staff with the knowledge to respond effectively. Use the screener to flag learners
          for medical follow-up, and the registry to track confirmed cases and their action plans.
        </p>
      </div>
    </div>
  )
}

export default Dashboard