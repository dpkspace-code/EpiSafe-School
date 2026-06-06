import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Dashboard({ setPage }) {
  const [learnerCount, setLearnerCount] = useState(0)
  const [screeningCount, setScreeningCount] = useState(0)
  const [highRiskCount, setHighRiskCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [seizureData, setSeizureData] = useState([])
  const [triggerData, setTriggerData] = useState([])

  useEffect(() => {
    async function fetchStats() {
      const { count: lCount } = await supabase
        .from('learners').select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: sCount } = await supabase
        .from('screener_responses').select('*', { count: 'exact', head: true })

      const { count: hCount } = await supabase
        .from('screener_responses').select('*', { count: 'exact', head: true })
        .eq('risk_level', 'High')

      const { count: pCount } = await supabase
        .from('learners').select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { data: learners } = await supabase
        .from('learners').select('seizure_type, triggers')
        .eq('status', 'active')

      setLearnerCount(lCount || 0)
      setScreeningCount(sCount || 0)
      setHighRiskCount(hCount || 0)
      setPendingCount(pCount || 0)

      if (learners) {
        const seizureCounts = {}
        learners.forEach(l => {
          if (l.seizure_type) seizureCounts[l.seizure_type] = (seizureCounts[l.seizure_type] || 0) + 1
        })
        setSeizureData(Object.entries(seizureCounts).map(([name, count]) => ({ name, count })))

        const triggerCounts = {}
        learners.forEach(l => {
          if (l.triggers) triggerCounts[l.triggers] = (triggerCounts[l.triggers] || 0) + 1
        })
        setTriggerData(Object.entries(triggerCounts).map(([name, count]) => ({ name, count })))
      }
    }
    fetchStats()
  }, [])

  const colors = ['#3ECF8E','#185FA5','#BA7517','#A32D2D','#3B6D11','#993556']

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
                <div style={{ width: `${(d.count / max) * 100}%`, background: colors[i % colors.length], height: '100%', borderRadius: '4px' }} />
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
          <div className="stat-label">Confirmed in Registry</div>
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

      {pendingCount > 0 && (
        <div className="card" style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: '#854F0B', marginBottom: '4px' }}>⏳ Pending Approvals</h2>
              <p style={{ color: '#854F0B', fontSize: '13px' }}>
                <strong>{pendingCount}</strong> learner{pendingCount > 1 ? 's' : ''} waiting for your review and approval
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setPage('pending')}>
              Review Now →
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <BarChart data={seizureData} title="📊 Seizure Types" emptyMsg="No confirmed learner data yet" />
        <BarChart data={triggerData} title="⚡ Common Triggers" emptyMsg="No trigger data yet" />
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setPage('screener')}>📋 New Screening</button>
          <button className="btn btn-primary" onClick={() => setPage('registry')}>➕ Add Learner</button>
          <button className="btn btn-secondary" onClick={() => setPage('guides')}>📖 View Guides</button>
          {pendingCount > 0 && <button className="btn" style={{ background: '#ffe58f', color: '#854F0B' }} onClick={() => setPage('pending')}>⏳ Pending ({pendingCount})</button>}
        </div>
      </div>

      <div className="card">
        <h2>About EpiSafe</h2>
        <p style={{ lineHeight: '1.7' }}>
          EpiSafe helps schools identify learners at risk of seizures, maintain a secure epilepsy registry,
          and equip staff with the knowledge to respond effectively.
        </p>
      </div>
    </div>
  )
}

export default Dashboard